import { PrismaClient } from '@prisma/client';
import { LinkquCallbackWorkerService } from './linkqu-callback-worker.service';
import {
  validateAndGetTestDatabaseUrl,
  createTestPrismaClient,
} from '../../common/test-utils/test-db-validator';

/**
 * C2 Integration Tests against Isolated PostgreSQL Test Database
 * Menguji perilaku konkurensi 2 koneksi DB terpisah:
 * 1. Two-worker lease contention (race condition atomik).
 * 2. Worker crash recovery (pengambilan lease kedaluwarsa).
 * 3. Fencing token rejection (penolakan update jika lease kedaluwarsa).
 * 4. DB unique constraint fisik RiwayatSaldo.settlement_ref (penolakan duplicate ledger).
 * 5. Atomic event_hash deduplication pada payment_gateway_callback_inbox.
 *
 * Persyaratan T0:
 * - Wajib menyetel TEST_DATABASE_URL secara eksplisit (contoh: postgresql://.../outletpulsa_c2_test).
 * - Dilarang keras memakai DATABASE_URL aplikasi (outletpulsa_db).
 */
describe('Sub-package C2: Real PostgreSQL Integration Tests (2 Independent Clients)', () => {
  let prisma1: PrismaClient;
  let prisma2: PrismaClient;
  let workerService1: LinkquCallbackWorkerService;
  let workerService2: LinkquCallbackWorkerService;

  const TEST_PREFIX = `C2_TEST_${Date.now()}`;
  let testMemberId: number;

  beforeAll(async () => {
    // T0: Validasi ketat TEST_DATABASE_URL sebelum koneksi atau manipulasi apapun ke DB.
    // Jika TEST_DATABASE_URL tidak disetel atau mengarah ke DB aplikasi, suite integration langsung throw error.
    const testDbUrl = validateAndGetTestDatabaseUrl();
    prisma1 = createTestPrismaClient(testDbUrl);
    prisma2 = createTestPrismaClient(testDbUrl);
    await prisma1.$connect();
    await prisma2.$connect();

    // Inisialisasi 2 worker services independen dengan instance DB berbeda
    const dummySocket: any = { emitTransactionUpdated: jest.fn(), emitBalanceUpdated: jest.fn() };
    const dummyPengumuman: any = { sendTransactionStatus: jest.fn().mockResolvedValue(true) };

    workerService1 = new LinkquCallbackWorkerService(prisma1 as any, dummySocket, dummyPengumuman);
    workerService2 = new LinkquCallbackWorkerService(prisma2 as any, dummySocket, dummyPengumuman);

    // Buat member uji untuk pengetesan ledger
    const testMember = await prisma1.member.create({
      data: {
        kode: `MBR-${TEST_PREFIX}`,
        fullname: `${TEST_PREFIX}_MEMBER`,
        whatsappnumber: `08${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        password: 'hash',
        saldo: 100000,
      },
    });
    testMemberId = testMember.id;
  });

  afterAll(async () => {
    // Cleanup data uji
    try {
      if (prisma1) {
        await prisma1.riwayatSaldo.deleteMany({
          where: { settlement_ref: { startsWith: TEST_PREFIX } },
        });
        await prisma1.paymentGatewayCallbackInbox.deleteMany({
          where: { partner_reff: { startsWith: TEST_PREFIX } },
        });
        await prisma1.paymentGatewayTransaction.deleteMany({
          where: { partner_reff: { startsWith: TEST_PREFIX } },
        });
        if (testMemberId) {
          await prisma1.member.delete({ where: { id: testMemberId } }).catch(() => {});
        }
      }
    } finally {
      if (prisma1) await prisma1.$disconnect().catch(() => {});
      if (prisma2) await prisma2.$disconnect().catch(() => {});
    }
  });

  it('C2-PG-01: Dua worker berebut lease secara bersamaan -> Tepat 1 berhasil mengunci', async () => {
    const partnerReff = `${TEST_PREFIX}_CONTENTION_01`;
    const eventHash = `HASH_${partnerReff}`;

    // 1. Simpan inbox item berstatus PENDING
    const inbox = await prisma1.paymentGatewayCallbackInbox.create({
      data: {
        provider: 'LINKQU',
        merchant_id: 'TEST_MERCHANT',
        partner_reff: partnerReff,
        event_hash: eventHash,
        status: 'PENDING',
        payload: JSON.stringify({ partner_reff: partnerReff }),
        next_retry_at: new Date(Date.now() - 5000), // Siap diproses
      },
    });

    const workerId1 = 'worker-client-1';
    const workerId2 = 'worker-client-2';
    const leaseExpiry = new Date(Date.now() + 30000);

    // 2. Eksekusi klaim secara serentak (Promise.all) melalui dua client PostgreSQL berbeda
    const [claim1, claim2] = await Promise.all([
      prisma1.paymentGatewayCallbackInbox.updateMany({
        where: {
          id: inbox.id,
          OR: [
            { status: 'PENDING' },
            { status: 'PROCESSING', locked_until: { lt: new Date() } },
          ],
        },
        data: {
          status: 'PROCESSING',
          locked_by: workerId1,
          locked_until: leaseExpiry,
        },
      }),
      prisma2.paymentGatewayCallbackInbox.updateMany({
        where: {
          id: inbox.id,
          OR: [
            { status: 'PENDING' },
            { status: 'PROCESSING', locked_until: { lt: new Date() } },
          ],
        },
        data: {
          status: 'PROCESSING',
          locked_by: workerId2,
          locked_until: leaseExpiry,
        },
      }),
    ]);

    // 3. Verifikasi: Tepat 1 worker yang menang klaim (count = 1), worker lain kalah (count = 0)
    const totalWins = claim1.count + claim2.count;
    expect(totalWins).toBe(1);

    const winnerId = claim1.count === 1 ? workerId1 : workerId2;
    const loserId = claim1.count === 1 ? workerId2 : workerId1;

    // 4. Verifikasi status akhir di database
    const finalInbox = await prisma1.paymentGatewayCallbackInbox.findUnique({
      where: { id: inbox.id },
    });
    expect(finalInbox?.status).toBe('PROCESSING');
    expect(finalInbox?.locked_by).toBe(winnerId);
    expect(finalInbox?.locked_by).not.toBe(loserId);
  });

  it('C2-PG-02: Worker crash (lease kedaluwarsa) -> Worker kedua berhasil memulihkan lease', async () => {
    const partnerReff = `${TEST_PREFIX}_CRASH_RECOVERY`;
    const eventHash = `HASH_${partnerReff}`;
    const crashedWorkerId = 'worker-crashed-node';
    const recoveryWorkerId = 'worker-recovery-node';

    // 1. Simpan inbox item dalam keadaan PROCESSING tetapi lease sudah kedaluwarsa 10 detik lalu
    const expiredTime = new Date(Date.now() - 10000);
    const inbox = await prisma1.paymentGatewayCallbackInbox.create({
      data: {
        provider: 'LINKQU',
        merchant_id: 'TEST_MERCHANT',
        partner_reff: partnerReff,
        event_hash: eventHash,
        status: 'PROCESSING',
        locked_by: crashedWorkerId,
        locked_until: expiredTime,
        payload: JSON.stringify({ partner_reff: partnerReff }),
      },
    });

    // 2. Worker 2 menjalankan claimBatch
    const claimedByWorker2 = await workerService2.claimBatch(recoveryWorkerId, 10, 30000);

    // 3. Verifikasi: Worker 2 berhasil merebut lease yang ditinggalkan worker yang crash
    const recoveredItem = claimedByWorker2.find((item) => item.id === inbox.id);
    expect(recoveredItem).toBeDefined();
    expect(recoveredItem?.locked_by).toBe(recoveryWorkerId);

    // 4. Verifikasi state fisik di DB melalui client 1
    const dbState = await prisma1.paymentGatewayCallbackInbox.findUnique({
      where: { id: inbox.id },
    });
    expect(dbState?.status).toBe('PROCESSING');
    expect(dbState?.locked_by).toBe(recoveryWorkerId);
    expect(new Date(dbState?.locked_until!).getTime()).toBeGreaterThan(Date.now());
  });

  it('C2-PG-03: Fencing token rejection -> Update ditolak saat lease kedaluwarsa atau dicuri', async () => {
    const partnerReff = `${TEST_PREFIX}_FENCING_REJECT`;
    const eventHash = `HASH_${partnerReff}`;
    const oldWorkerId = 'worker-old-slow';

    // 1. Inbox item pernah dikunci oldWorker tetapi leasenya sudah kedaluwarsa
    const expiredTime = new Date(Date.now() - 5000);
    const inbox = await prisma1.paymentGatewayCallbackInbox.create({
      data: {
        provider: 'LINKQU',
        merchant_id: 'TEST_MERCHANT',
        partner_reff: partnerReff,
        event_hash: eventHash,
        status: 'PROCESSING',
        locked_by: oldWorkerId,
        locked_until: expiredTime,
        payload: JSON.stringify({ partner_reff: partnerReff }),
      },
    });

    // 2. Old worker mencoba menyelesaikan pemrosesan dengan fencing token check (locked_until >= now)
    const updateResult = await prisma1.paymentGatewayCallbackInbox.updateMany({
      where: {
        id: inbox.id,
        locked_by: oldWorkerId,
        locked_until: { gte: new Date() }, // Fencing token check
      },
      data: {
        status: 'PROCESSED',
        processed_at: new Date(),
      },
    });

    // 3. Verifikasi: Ditolak (count === 0), status di DB tetap PROCESSING
    expect(updateResult.count).toBe(0);

    const checkDb = await prisma1.paymentGatewayCallbackInbox.findUnique({
      where: { id: inbox.id },
    });
    expect(checkDb?.status).toBe('PROCESSING'); // Tidak pernah berubah jadi PROCESSED!
  });

  it('C2-PG-04: DB Unique constraint RiwayatSaldo.settlement_ref menolak duplikasi & rollback transaksi', async () => {
    const settlementRef = `${TEST_PREFIX}_SETTLE_UNIQUE_01`;
    const nominal = 25000;

    // 1. Buat RiwayatSaldo pertama dengan settlement_ref unik
    const firstLedger = await prisma1.riwayatSaldo.create({
      data: {
        kode: `LEDGER_1_${TEST_PREFIX}`,
        member_id: testMemberId,
        nominal: nominal,
        saldo_sebelumnya: 100000,
        saldo_setelahnya: 125000,
        status: 'deposit',
        settlement_ref: settlementRef,
        ket: 'Kredit pertama via LinkQu',
      },
    });
    expect(firstLedger.id).toBeDefined();
    expect(firstLedger.settlement_ref).toBe(settlementRef);

    // 2. Coba buat RiwayatSaldo kedua dengan settlement_ref yang sama di dalam $transaction
    let transactionRolledBack = false;
    try {
      await prisma2.$transaction(async (tx) => {
        // Increment saldo dummy
        await tx.member.update({
          where: { id: testMemberId },
          data: { saldo: { increment: nominal } },
        });

        // Duplikat insert settlement_ref yang sama
        await tx.riwayatSaldo.create({
          data: {
            kode: `LEDGER_2_${TEST_PREFIX}`,
            member_id: testMemberId,
            nominal: nominal,
            saldo_sebelumnya: 125000,
            saldo_setelahnya: 150000,
            status: 'deposit',
            settlement_ref: settlementRef, // DUPLIKAT! Wajib ditolak PostgreSQL
            ket: 'Kredit kedua ilegal',
          },
        });
      });
    } catch (err: any) {
      transactionRolledBack = true;
      // Prisma P2002 = Unique constraint violation
      expect(err.code).toBe('P2002');
    }

    expect(transactionRolledBack).toBe(true);

    // 3. Verifikasi: Saldo member TIDAK pernah bertambah (rollback atomik berhasil)
    const memberAfter = await prisma1.member.findUnique({ where: { id: testMemberId } });
    expect(memberAfter?.saldo).toBe(100000); // Saldo tetap aman, tidak ter-increment!

    // 4. Verifikasi: Hanya ada 1 ledger di DB
    const ledgerCount = await prisma1.riwayatSaldo.count({
      where: { settlement_ref: settlementRef },
    });
    expect(ledgerCount).toBe(1);
  });

  it('C2-PG-05: Atomic event_hash deduplication pada payment_gateway_callback_inbox', async () => {
    const partnerReff = `${TEST_PREFIX}_EVENT_DEDUP`;
    const eventHash = `HASH_EVENT_DEDUP_${partnerReff}`;

    // 1. Insert pertama sukses
    const firstInsert = await prisma1.paymentGatewayCallbackInbox.create({
      data: {
        provider: 'LINKQU',
        merchant_id: 'MERCHANT_01',
        partner_reff: partnerReff,
        event_hash: eventHash,
        payload: JSON.stringify({ amount: 50000 }),
      },
    });
    expect(firstInsert.id).toBeDefined();

    // 2. Insert kedua dengan event_hash sama via client 2 wajib throw P2002
    let duplicateRejected = false;
    try {
      await prisma2.paymentGatewayCallbackInbox.create({
        data: {
          provider: 'LINKQU',
          merchant_id: 'MERCHANT_01',
          partner_reff: partnerReff,
          event_hash: eventHash, // DUPLICATE!
          payload: JSON.stringify({ amount: 50000 }),
        },
      });
    } catch (err: any) {
      duplicateRejected = true;
      expect(err.code).toBe('P2002');
    }

    expect(duplicateRejected).toBe(true);

    // 3. Total record dengan hash tersebut tetap tepat 1
    const totalCount = await prisma1.paymentGatewayCallbackInbox.count({
      where: { event_hash: eventHash },
    });
    expect(totalCount).toBe(1);
  });
});
