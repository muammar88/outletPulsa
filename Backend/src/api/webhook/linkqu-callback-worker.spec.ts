import { Test, TestingModule } from '@nestjs/testing';
import { LinkquCallbackWorkerService } from './linkqu-callback-worker.service';
import { PrismaService } from '../../prisma.service';
import { SocketService } from '../../socket/socket.service';
import { PengumumanService } from '../../pengumuman/pengumuman.service';
import { LinkquCallbackProcessorService, LINKQU_SETTLEMENT_ADAPTER } from './linkqu-callback-processor.service';
import { TestLinkquSettlementAdapter } from './test-only/test-linkqu-settlement.adapter';
import * as crypto from 'crypto';

describe('LinkquCallbackWorkerService (C2 Durable Recovery Worker)', () => {
  let workerService: LinkquCallbackWorkerService;
  let prismaMock: any;
  let socketMock: any;
  let pengumumanMock: any;
  let injectAdapter = false;

  const SECRET_KEY = 'test_secret_key_123';
  const CLIENT_ID = 'client_linkqu_001';

  function createSignature(amount: number, partnerReff: string, status: string, secret = SECRET_KEY): string {
    const dataString = (String(amount) + partnerReff + status).replace(/[^0-9a-zA-Z]/g, '').toLowerCase();
    return crypto.createHmac('sha256', secret).update(dataString).digest('hex');
  }

  beforeEach(async () => {
    prismaMock = {
      pengaturanUmum: {
        findFirst: jest.fn().mockResolvedValue({
          linkqu_signature_key: SECRET_KEY,
          linkqu_client_id: CLIENT_ID,
        }),
      },
      paymentGatewayCallbackInbox: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        update: jest.fn(),
      },
      paymentGatewayTransaction: {
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      requestDeposit: {
        update: jest.fn(),
      },
      member: {
        update: jest.fn().mockResolvedValue({ id: 1, saldo: 150000 }),
      },
      riwayatSaldo: {
        create: jest.fn().mockResolvedValue({ id: 99 }),
      },
      activityLog: {
        create: jest.fn().mockResolvedValue({ id: 1 }),
      },
      $transaction: jest.fn(async (cb) => cb(prismaMock)),
    };

    socketMock = {
      emitTransactionUpdated: jest.fn(),
      emitBalanceUpdated: jest.fn(),
    };

    pengumumanMock = {
      sendTransactionStatus: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LinkquCallbackWorkerService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: SocketService, useValue: socketMock },
        { provide: PengumumanService, useValue: pengumumanMock },
        LinkquCallbackProcessorService,
        ...(injectAdapter ? [{ provide: LINKQU_SETTLEMENT_ADAPTER, useClass: TestLinkquSettlementAdapter }] : []),
      ],
    }).compile();

    workerService = module.get<LinkquCallbackWorkerService>(LinkquCallbackWorkerService);
  });

  it('C2-WORKER-01: claimBatch mengunci item PENDING dan item PROCESSING dengan lease kedaluwarsa', async () => {
    const now = new Date();
    const candidateItems = [
      { id: 1, status: 'PENDING', next_retry_at: new Date(now.getTime() - 1000) },
      { id: 2, status: 'PROCESSING', locked_until: new Date(now.getTime() - 5000) },
    ];
    prismaMock.paymentGatewayCallbackInbox.findMany.mockResolvedValue(candidateItems);
    prismaMock.paymentGatewayCallbackInbox.updateMany.mockResolvedValue({ count: 1 });

    const claimed = await workerService.claimBatch('worker-test-1', 10, 30000);
    expect(claimed).toHaveLength(2);
    expect(prismaMock.paymentGatewayCallbackInbox.updateMany).toHaveBeenCalledTimes(2);
  });

  it('C2-WORKER-02: processInboxItem menolak pemrosesan jika fencing token tidak cocok atau lease kedaluwarsa', async () => {
    const expiredItem = {
      id: 10,
      locked_by: 'worker-test-1',
      locked_until: new Date(Date.now() - 5000), // Kedaluwarsa!
      payload: JSON.stringify({}),
    };

    const result = await workerService.processInboxItem(expiredItem, 'worker-test-1');
    expect(result.status).toBe('FENCING_REJECTED');
  });

  it('C2-WORKER-03: processInboxItem melakukan re-autentikasi penuh dan menolak payload dengan signature invalid', async () => {
    const item = {
      id: 11,
      locked_by: 'worker-test-1',
      locked_until: new Date(Date.now() + 30000),
      payload: JSON.stringify({
        partner_reff: 'REFF_INVALID_SIG',
        amount: 50000,
        status: 'SUCCESS',
        signature: 'invalid_sig_abc_123',
      }),
      headers: null,
    };

    const result = await workerService.processInboxItem(item, 'worker-test-1');
    expect(result.status).toBe('FAILED');
    expect(result.message?.toLowerCase()).toContain('signature');
  });

  it('C2-WORKER-06 (No Adapter): Menahan event jika tidak ada adapter settlement produksi', async () => {
    const partnerReff = 'REFF_HOLD';
    const amount = 50000;
    const signature = createSignature(amount, partnerReff, 'SUCCESS');

    const item = {
      id: 14,
      locked_by: 'worker-test-1',
      locked_until: new Date(Date.now() + 30000),
      payload: JSON.stringify({
        partner_reff: partnerReff,
        amount,
        status: 'SUCCESS',
        signature,
        client_id: CLIENT_ID,
      }),
      headers: null,
      retry_count: 0,
      max_retries: 5,
    };

    const result = await workerService.processInboxItem(item, 'worker-test-1');
    expect(result.status).toBe('FAILED');
    expect(result.message).toBe('Held for contract verification');
    
    expect(prismaMock.paymentGatewayCallbackInbox.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'PENDING_CONTRACT_VERIFICATION',
        }),
      }),
    );
  });

  describe('C2-WORKER-07 (With Adapter): Primitive Settlement', () => {
    beforeAll(() => {
      injectAdapter = true;
    });

    afterAll(() => {
      injectAdapter = false;
    });

    it('C2-WORKER-04: Exponential backoff jika transaksi lokal belum ditemukan (callback tiba duluan)', async () => {
      const partnerReff = 'REFF_WAITING_TX';
      const amount = 50000;
      const signature = createSignature(amount, partnerReff, 'SUCCESS');

      const item = {
        id: 12,
        locked_by: 'worker-test-1',
        locked_until: new Date(Date.now() + 30000),
        payload: JSON.stringify({
          partner_reff: partnerReff,
          amount,
          status: 'SUCCESS',
          signature,
          client_id: CLIENT_ID,
        }),
        headers: null,
        retry_count: 1,
        max_retries: 5,
      };

      // Transaksi lokal belum ada di DB
      prismaMock.paymentGatewayTransaction.findUnique.mockResolvedValue(null);

      const result = await workerService.processInboxItem(item, 'worker-test-1');
      expect(result.status).toBe('RETRY');
      expect(prismaMock.paymentGatewayCallbackInbox.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'PENDING',
            retry_count: 2,
          }),
        }),
      );
    });

    it('C2-WORKER-05: Pindah ke MANUAL_REVIEW setelah mencapai batas max_retries', async () => {
      const partnerReff = 'REFF_MAX_RETRIES';
      const amount = 50000;
      const signature = createSignature(amount, partnerReff, 'SUCCESS');

      const item = {
        id: 13,
        locked_by: 'worker-test-1',
        locked_until: new Date(Date.now() + 30000),
        payload: JSON.stringify({
          partner_reff: partnerReff,
          amount,
          status: 'SUCCESS',
          signature,
          client_id: CLIENT_ID,
        }),
        headers: null,
        retry_count: 4,
        max_retries: 5, // Batas 5
      };

      prismaMock.paymentGatewayTransaction.findUnique.mockResolvedValue(null);

      const result = await workerService.processInboxItem(item, 'worker-test-1');
      expect(result.status).toBe('FAILED');
      expect(prismaMock.paymentGatewayCallbackInbox.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'MANUAL_REVIEW',
          }),
        }),
      );
    });

    it('Eksekusi settlement atomik dengan constraint settlement_ref unik & update inbox ke PROCESSED', async () => {
      const partnerReff = 'REFF_SUCCESS_SETTLE';
      const amount = 50000;
      const signature = createSignature(amount, partnerReff, 'SUCCESS');

      const item = {
        id: 15,
        locked_by: 'worker-test-1',
        locked_until: new Date(Date.now() + 30000),
        payload: JSON.stringify({
          partner_reff: partnerReff,
          amount,
          status: 'SUCCESS',
          signature,
          client_id: CLIENT_ID,
        }),
        headers: null,
        retry_count: 0,
        max_retries: 5,
      };

      prismaMock.paymentGatewayTransaction.findUnique.mockResolvedValue({
        id: 100,
        partner_reff: partnerReff,
        amount: 50000,
        status: 'PENDING',
        provider: 'LINKQU',
        reference_type: 'DEPOSIT',
        payment_method: 'VA_PERMATA',
        requestDeposit: {
          id: 200,
          kode: 'DEP-200',
          status: 'proses',
          nominal: 50000,
          riwayatTransaksiId: 300,
          riwayatTransaksi: {
            member: { id: 1, saldo: 100000 },
          },
        },
      });

      const result = await workerService.processInboxItem(item, 'worker-test-1');
      expect(result.status).toBe('PROCESSED');

      // Pastikan klaim PENDING -> SUCCESS dengan settlement_ref deterministik
      expect(prismaMock.paymentGatewayTransaction.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 100, status: 'PENDING' },
          data: expect.objectContaining({
            status: 'SUCCESS',
            settlement_ref: `SETTLE-LINKQU-${partnerReff}`,
          }),
        }),
      );

      // Pastikan saldo member di-increment
      expect(prismaMock.member.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: { saldo: { increment: 50000 } },
        }),
      );

      // Pastikan riwayatSaldo dibuat dengan settlement_ref unik
      expect(prismaMock.riwayatSaldo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            member_id: 1,
            nominal: 50000,
            status: 'deposit',
            settlement_ref: `SETTLE-LINKQU-${partnerReff}`,
          }),
        }),
      );

      // Pastikan settlement_ledger_id dikaitkan ke gateway
      expect(prismaMock.paymentGatewayTransaction.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 100 },
          data: { settlement_ledger_id: 99 },
        }),
      );
    });
  });
});
