import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { TransaksiPulsaService } from './transaksi_pulsa.service';
import { TransaksiFinalizerService } from '../../api/transaksi/transaksi-finalizer.service';
import { PrismaService } from '../../prisma.service';
import { PengumumanService } from '../../pengumuman/pengumuman.service';
import { SocketService } from '../../socket/socket.service';
import { IakService } from '../../providers/iak.service';
import { DigiflazzService } from '../../providers/digiflazz.service';
import { TripayService } from '../../providers/tripay.service';

/**
 * Stateful DB Mock in memory to simulate real database concurrency and record persistence
 * without connecting to any production database.
 */
class InMemoryDatabase {
  transactions = new Map<number, any>();
  members = new Map<number, any>();
  riwayatSaldos: any[] = [];
  riwayatTransaksis: any[] = [];
  // B2: activityLog para status conflict dan audit tanpa bukti debit
  activityLogs: any[] = [];

  reset() {
    this.transactions.clear();
    this.members.clear();
    this.riwayatSaldos = [];
    this.riwayatTransaksis = [];
    this.activityLogs = [];
  }

  seedMember(id: number, saldo = 50000) {
    const member = { id, fullname: `Member ${id}`, saldo };
    this.members.set(id, member);
    return member;
  }

  seedTransaction(id: number, memberId: number, status = 'proses', sellingPrice = 10000, feeAgen = 20) {
    const member = this.members.get(memberId) || this.seedMember(memberId);
    const tx = {
      id,
      kode: `TRX-${id}`,
      nomorTujuan: '081234567890',
      status,
      selling_price: sellingPrice,
      fee_agen: feeAgen,
      purchase_price: 9800,
      ket: 'Initial pending order',
      serial_number: null,
      // B2: bukti debit historis — saldo_sebelum > saldo_sesudah membuktikan debit terjadi
      saldo_sebelum: member.saldo + sellingPrice + feeAgen,
      saldo_sesudah: member.saldo,
      refund_id: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      riwayatTransaksiId: id * 10,
      riwayatTransaksi: {
        id: id * 10,
        memberId: member.id,
        member: { ...member },
      },
      produk: { name: 'Telkomsel 10K', kode: 'T10' },
      server: { kode: 'DIGI', name: 'Digiflazz' },
    };
    this.transactions.set(id, tx);
    return tx;
  }

  createPrismaMock() {
    const db = this;

    const prismaMock: any = {
      transaction: {
        findUnique: jest.fn(async ({ where }: { where: { id: number } }) => {
          const tx = db.transactions.get(where.id);
          if (!tx) return null;
          // Refresh member data from member table
          const member = db.members.get(tx.riwayatTransaksi.memberId);
          return JSON.parse(
            JSON.stringify({
              ...tx,
              riwayatTransaksi: {
                ...tx.riwayatTransaksi,
                member: member ? { ...member } : tx.riwayatTransaksi.member,
              },
            }),
          );
        }),
        update: jest.fn(async ({ where, data }: { where: { id: number }; data: any }) => {
          const tx = db.transactions.get(where.id);
          if (!tx) throw new Error(`Transaction #${where.id} not found`);
          for (const [key, val] of Object.entries(data)) {
            if (val !== undefined) {
              tx[key] = val;
            }
          }
          return JSON.parse(JSON.stringify(tx));
        }),
        updateMany: jest.fn(async ({ where, data }: { where: any; data: any }) => {
          const tx = db.transactions.get(where.id);
          if (!tx) return { count: 0 };

          // Cek status filter
          if (where.status !== undefined) {
            if (typeof where.status === 'string') {
              if (tx.status !== where.status) return { count: 0 };
            } else if (where.status.not !== undefined) {
              if (tx.status === where.status.not) return { count: 0 };
            }
          }

          for (const [key, val] of Object.entries(data)) {
            if (val !== undefined) {
              tx[key] = val;
            }
          }
          return { count: 1 };
        }),
      },
      member: {
        update: jest.fn(async ({ where, data }: { where: { id: number }; data: any }) => {
          const member = db.members.get(where.id);
          if (!member) throw new Error(`Member #${where.id} not found`);

          if (data.saldo?.increment !== undefined) {
            member.saldo = Number(member.saldo) + Number(data.saldo.increment);
          } else if (data.saldo !== undefined) {
            member.saldo = Number(data.saldo);
          }
          return JSON.parse(JSON.stringify(member));
        }),
      },
      riwayatSaldo: {
        create: jest.fn(async ({ data }: { data: any }) => {
          const record = { id: db.riwayatSaldos.length + 1, ...data };
          db.riwayatSaldos.push(record);
          return JSON.parse(JSON.stringify(record));
        }),
      },
      riwayatTransaksi: {
        create: jest.fn(async ({ data }: { data: any }) => {
          const record = { id: db.riwayatTransaksis.length + 1, ...data };
          db.riwayatTransaksis.push(record);
          return JSON.parse(JSON.stringify(record));
        }),
      },
      // B2: activityLog mock untuk status conflict dan refund audit
      activityLog: {
        create: jest.fn(async ({ data }: { data: any }) => {
          const record = { id: db.activityLogs.length + 1, ...data, createdAt: new Date() };
          db.activityLogs.push(record);
          return JSON.parse(JSON.stringify(record));
        }),
      },
      $transaction: jest.fn(async (cb: any) => {
        return cb(prismaMock);
      }),
    };

    return prismaMock;
  }
}

describe('Paket B (B1): Tutup Jalur Admin Membuka Status Final', () => {
  let db: InMemoryDatabase;
  let prismaMock: any;
  let adminService: TransaksiPulsaService;
  let finalizerService: TransaksiFinalizerService;

  beforeEach(async () => {
    db = new InMemoryDatabase();
    prismaMock = db.createPrismaMock();

    const pengumumanMock = {
      sendTransactionStatus: jest.fn().mockResolvedValue(true),
    };

    const socketMock = {
      emitTransactionUpdated: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransaksiPulsaService,
        TransaksiFinalizerService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: PengumumanService, useValue: pengumumanMock },
        { provide: SocketService, useValue: socketMock },
        { provide: IakService, useValue: {} },
        { provide: DigiflazzService, useValue: {} },
        { provide: TripayService, useValue: {} },
      ],
    }).compile();

    adminService = module.get<TransaksiPulsaService>(TransaksiPulsaService);
    finalizerService = module.get<TransaksiFinalizerService>(TransaksiFinalizerService);
  });

  describe('1. Alur Regression: gagal -> proses -> gagal (Anti-Reopen & Anti-Double Refund)', () => {
    it('harus menolak admin membuka status gagal ke proses dan mencegah refund ganda', async () => {
      // 1. Initial State: Transaksi baru dalam status 'proses', saldo member = 50.000
      db.seedMember(1, 50000);
      db.seedTransaction(101, 1, 'proses', 10000, 20);

      // Transaksi gagal diproses pertama kali oleh provider / finalizer
      const initialFail = await finalizerService.finalizeTransaction({
        transactionId: 101,
        targetStatus: 'gagal',
        source: 'INITIAL_PROVIDER_FAIL',
      });

      expect(initialFail.finalized).toBe(true);
      expect(initialFail.status).toBe('gagal');
      // Saldo member bertambah Rp10.020 (50.000 + 10.020 = 60.020)
      expect(db.members.get(1).saldo).toBe(60020);
      expect(db.riwayatSaldos.length).toBe(1);

      const txAfterFirstFail = db.transactions.get(101);
      expect(txAfterFirstFail.status).toBe('gagal');

      // 2. Step A: Admin mencoba membuka kembali status transaksi 'gagal' menjadi 'proses'
      await expect(
        adminService.updateStatus(101, {
          status: 'proses',
          keterangan: 'Admin mencoba membuka status',
        }),
      ).rejects.toThrow(ConflictException);

      // Pastikan status di database TETAP 'gagal' (tidak berhasil diubah ke proses)
      expect(db.transactions.get(101).status).toBe('gagal');

      // 3. Step B: Admin atau sistem kemudian memanggil status 'gagal' lagi
      const secondFailResult = await adminService.updateStatus(101, {
        status: 'gagal',
        keterangan: 'Mencoba gagal kedua',
      });

      expect(secondFailResult.status).toBe('gagal');
      // KRUSIAL: Saldo member TIDAK BOLEH bertambah lagi (tetap 60.020, bukan 70.040)
      expect(db.members.get(1).saldo).toBe(60020);
      // Riwayat saldo tidak bertambah (tetap 1)
      expect(db.riwayatSaldos.length).toBe(1);
    });
  });

  describe('2. Alur Regression: sukses -> proses -> gagal (Anti-Reopen & Anti-Fraudulent Refund)', () => {
    it('harus menolak admin membuka status sukses ke proses dan menolak refund untuk pulsa yang sudah terkirim', async () => {
      // 1. Initial State: Transaksi baru dalam status 'proses', saldo member = 50.000
      db.seedMember(2, 50000);
      db.seedTransaction(201, 2, 'proses', 10000, 20);

      // Transaksi sukses diproses oleh provider
      const initialSuccess = await finalizerService.finalizeTransaction({
        transactionId: 201,
        targetStatus: 'sukses',
        sn: 'SN123456789',
        source: 'INITIAL_PROVIDER_SUCCESS',
      });

      expect(initialSuccess.finalized).toBe(true);
      expect(initialSuccess.status).toBe('sukses');
      // Saldo member tetap 50.000 (tidak ada refund untuk sukses)
      expect(db.members.get(2).saldo).toBe(50000);
      expect(db.riwayatSaldos.length).toBe(0);

      // 2. Step A: Admin mencoba membuka kembali transaksi 'sukses' menjadi 'proses'
      await expect(
        adminService.updateStatus(201, {
          status: 'proses',
          keterangan: 'Membuka kembali sukses ke proses',
        }),
      ).rejects.toThrow(ConflictException);

      expect(db.transactions.get(201).status).toBe('sukses');

      // 3. Step B: Admin mencoba mengubah status transaksi menjadi 'gagal'
      await expect(
        adminService.updateStatus(201, {
          status: 'gagal',
          keterangan: 'Admin memaksakan gagal pada transaksi sukses',
        }),
      ).rejects.toThrow(ConflictException);

      // KRUSIAL: Saldo member tetap 50.000 (TIDAK BOLEH ADA REFUND)
      expect(db.members.get(2).saldo).toBe(50000);
      expect(db.riwayatSaldos.length).toBe(0);
      expect(db.transactions.get(201).status).toBe('sukses');
    });
  });

  describe('3. Validasi Konflik Status Final Antara Sukses dan Gagal Secara Langsung', () => {
    it('harus menolak perubahan langsung dari gagal ke sukses', async () => {
      db.seedMember(3, 50000);
      db.seedTransaction(301, 3, 'gagal', 10000, 20);

      await expect(
        adminService.updateStatus(301, {
          status: 'sukses',
          keterangan: 'Mengubah gagal menjadi sukses',
        }),
      ).rejects.toThrow(ConflictException);

      expect(db.transactions.get(301).status).toBe('gagal');
    });

    it('harus menolak perubahan langsung dari sukses ke gagal', async () => {
      db.seedMember(4, 50000);
      db.seedTransaction(401, 4, 'sukses', 10000, 20);

      await expect(
        adminService.updateStatus(401, {
          status: 'gagal',
          keterangan: 'Mengubah sukses menjadi gagal',
        }),
      ).rejects.toThrow(ConflictException);

      expect(db.transactions.get(401).status).toBe('sukses');
      expect(db.members.get(4).saldo).toBe(50000);
    });
  });

  describe('4. Transisi Status Valid yang Diizinkan dari Status Proses', () => {
    it('harus mengizinkan admin mengubah transaksi proses menjadi sukses', async () => {
      db.seedMember(5, 50000);
      db.seedTransaction(501, 5, 'proses', 10000, 20);

      const res = await adminService.updateStatus(501, {
        status: 'sukses',
        keterangan: 'Konfirmasi sukses manual admin',
      });

      expect(res.status).toBe('sukses');
      expect(db.transactions.get(501).status).toBe('sukses');
      // Tidak ada refund untuk sukses
      expect(db.members.get(5).saldo).toBe(50000);
    });

    it('harus mengizinkan admin mengubah transaksi proses menjadi gagal dan memberikan refund 1x', async () => {
      db.seedMember(6, 50000);
      db.seedTransaction(601, 6, 'proses', 10000, 20);

      const res = await adminService.updateStatus(601, {
        status: 'gagal',
        keterangan: 'Nomor tidak valid',
      });

      expect(res.status).toBe('gagal');
      expect(db.transactions.get(601).status).toBe('gagal');
      // Refund 10.020 ke saldo member
      expect(db.members.get(6).saldo).toBe(60020);
      expect(db.riwayatSaldos.length).toBe(1);
    });

    it('harus mengizinkan update keterangan pada transaksi yang masih proses', async () => {
      db.seedMember(7, 50000);
      db.seedTransaction(701, 7, 'proses', 10000, 20);

      const res = await adminService.updateStatus(701, {
        status: 'proses',
        keterangan: 'Menunggu konfirmasi manual provider',
      });

      expect(res.status).toBe('proses');
      expect(db.transactions.get(701).ket).toBe('Menunggu konfirmasi manual provider');
    });

    it('harus mempertahankan keterangan lama jika admin update proses -> proses tanpa keterangan (undefined)', async () => {
      db.seedMember(10, 50000);
      db.seedTransaction(1001, 10, 'proses', 10000, 20);
      db.transactions.get(1001).ket = 'Keterangan awal order yang sangat penting';

      const res = await adminService.updateStatus(1001, {
        status: 'proses',
        // keterangan sengaja undefined
      });

      expect(res.status).toBe('proses');
      expect(db.transactions.get(1001).ket).toBe('Keterangan awal order yang sangat penting');
      expect(res.ket).toBe('Keterangan awal order yang sangat penting');
    });

    it('harus menolak admin membuka status expired menjadi proses', async () => {
      db.seedMember(11, 50000);
      db.seedTransaction(1101, 11, 'expired', 10000, 20);
      db.transactions.get(1101).ket = 'Kedaluwarsa oleh sistem';

      await expect(
        adminService.updateStatus(1101, {
          status: 'proses',
          keterangan: 'Membuka expired ke proses',
        }),
      ).rejects.toThrow(ConflictException);

      expect(db.transactions.get(1101).status).toBe('expired');
      expect(db.transactions.get(1101).ket).toBe('Kedaluwarsa oleh sistem');
    });
  });

  describe('5. Balapan Admin vs Callback (Concurrency Race Condition Simulation)', () => {
    it('saat callback sukses dan admin gagal memproses bersamaan, tepat satu yang menang dan saldo tidak bocor', async () => {
      db.seedMember(8, 50000);
      db.seedTransaction(801, 8, 'proses', 10000, 20);

      // Eksekusi paralel: Callback finalizer (sukses) vs Admin updateStatus (gagal)
      const [callbackResult, adminResult] = await Promise.allSettled([
        finalizerService.finalizeTransaction({
          transactionId: 801,
          targetStatus: 'sukses',
          sn: 'SN-RACE-WINNER',
          source: 'CALLBACK_FAST',
        }),
        adminService.updateStatus(801, {
          status: 'gagal',
          keterangan: 'Admin klik gagal bersamaan dengan callback',
        }),
      ]);

      // Tepat satu operasi yang memenangkan transisi
      const finalTx = db.transactions.get(801);
      expect(['sukses', 'gagal']).toContain(finalTx.status);

      // Jika callback sukses yang memenangkan claim:
      if (finalTx.status === 'sukses') {
        expect(callbackResult.status).toBe('fulfilled');
        // Admin ditolak dengan ConflictException
        expect(adminResult.status).toBe('rejected');
        // Saldo tetap 50.000 (tidak ada refund palsu)
        expect(db.members.get(8).saldo).toBe(50000);
        expect(db.riwayatSaldos.length).toBe(0);
      } else {
        // Jika admin gagal yang memenangkan claim:
        expect(adminResult.status).toBe('fulfilled');
        expect(db.members.get(8).saldo).toBe(60020);
        expect(db.riwayatSaldos.length).toBe(1);
      }
    });
  });

  describe('6. Penanganan Kesalahan Input & Not Found', () => {
    it('harus melempar NotFoundException jika id transaksi tidak ditemukan untuk seluruh target status (proses, sukses, gagal)', async () => {
      await expect(
        adminService.updateStatus(999999, {
          status: 'proses',
        }),
      ).rejects.toThrow(NotFoundException);

      await expect(
        adminService.updateStatus(999999, {
          status: 'sukses',
        }),
      ).rejects.toThrow(NotFoundException);

      await expect(
        adminService.updateStatus(999999, {
          status: 'gagal',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('harus melempar BadRequestException jika status tidak valid', async () => {
      db.seedMember(9, 50000);
      db.seedTransaction(901, 9, 'proses');

      await expect(
        adminService.updateStatus(901, {
          status: 'invalid_status' as any,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
