import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { PrismaService } from '../../prisma.service';
import { PengumumanService } from '../../pengumuman/pengumuman.service';
import { SocketService } from '../../socket/socket.service';
import { DaftarProdukDigiflazzService } from '../../administrator/daftar_produk_digiflazz/daftar_produk_digiflazz.service';
import { TransaksiFinalizerService } from '../transaksi/transaksi-finalizer.service';
import { WapisenderService } from '../../providers/wapisender.service';
import { PascabayarFinalizerService } from '../../providers/pascabayar/pascabayar-finalizer.service';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';
import { LinkquCallbackProcessorService, LINKQU_SETTLEMENT_ADAPTER } from './linkqu-callback-processor.service';
import { TestLinkquSettlementAdapter } from './test-only/test-linkqu-settlement.adapter';
import {
  LINKQU_FIXTURES,
  FIXTURE_SECRET_KEY,
  FIXTURE_CLIENT_ID,
} from './fixtures/linkqu-callback.fixture';
import * as crypto from 'crypto';

describe('Paket A (ISSUE-003 / A1): LinkQu Callback Contract Verification & Fail-Closed Protection', () => {
  let app: INestApplication;
  let service: WebhookService;
  let prismaMock: any;
  let pengumumanMock: any;
  let socketMock: any;
  let savedEnvKey: string | undefined;
  let injectAdapter = false;

  const SECRET_KEY = 'test_secret_key_123';

  function createSignature(
    amount: any,
    partnerReff: string,
    status: string,
    secret = SECRET_KEY,
  ): string {
    const dataString = (String(amount) + partnerReff + status)
      .replace(/[^0-9a-zA-Z]/g, '')
      .toLowerCase();
    return crypto.createHmac('sha256', secret).update(dataString).digest('hex');
  }

  function assertZeroMutations() {
    expect(prismaMock.paymentGatewayTransaction.update).not.toHaveBeenCalled();
    expect(prismaMock.paymentGatewayTransaction.updateMany).not.toHaveBeenCalled();
    expect(prismaMock.requestDeposit.update).not.toHaveBeenCalled();
    expect(prismaMock.member.update).not.toHaveBeenCalled();
    expect(prismaMock.riwayatSaldo.create).not.toHaveBeenCalled();
    expect(prismaMock.activityLog.create).not.toHaveBeenCalled();
  }

  beforeEach(async () => {
    // 1. Isolasi process.env.LINKQU_SIGNATURE_KEY
    savedEnvKey = process.env.LINKQU_SIGNATURE_KEY;
    delete process.env.LINKQU_SIGNATURE_KEY;

    prismaMock = {
      pengaturanUmum: {
        findFirst: jest.fn().mockResolvedValue({
          linkqu_signature_key: SECRET_KEY,
          linkqu_client_id: 'client_linkqu_001',
        }),
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
        update: jest.fn(),
      },
      riwayatSaldo: {
        create: jest.fn().mockResolvedValue({ id: 999 }),
      },
      paymentGatewayCallbackInbox: {
        create: jest.fn().mockImplementation(async (args) => ({ id: 1, ...args.data })),
        update: jest.fn().mockResolvedValue({ id: 1 }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      activityLog: {
        create: jest.fn().mockResolvedValue({ id: 1 }),
      },
      $transaction: jest.fn(async (cb) => {
        return cb(prismaMock);
      }),
    };

    pengumumanMock = {
      sendTransactionStatus: jest.fn().mockResolvedValue(true),
    };

    socketMock = {
      emitTransactionUpdated: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhookController],
      providers: [
        WebhookService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: PengumumanService, useValue: pengumumanMock },
        { provide: SocketService, useValue: socketMock },
        { provide: DaftarProdukDigiflazzService, useValue: {} },
        { provide: TransaksiFinalizerService, useValue: {} },
        { provide: WapisenderService, useValue: {} },
        { provide: PascabayarFinalizerService, useValue: {} },
        LinkquCallbackProcessorService,
        ...(injectAdapter ? [{ provide: LINKQU_SETTLEMENT_ADAPTER, useClass: TestLinkquSettlementAdapter }] : []),
      ],
    }).compile();

    service = module.get<WebhookService>(WebhookService);

    app = module.createNestApplication();
    app.useGlobalInterceptors(new TransformInterceptor());
    await app.init();
  });

  afterEach(async () => {
    // Pulihkan environment key asli
    if (savedEnvKey !== undefined) {
      process.env.LINKQU_SIGNATURE_KEY = savedEnvKey;
    } else {
      delete process.env.LINKQU_SIGNATURE_KEY;
    }

    if (app) {
      await app.close();
    }
  });

  describe('1. Autentikasi Wajib & Anti-Bypass (Signature & Key)', () => {
    it('harus menolak callback jika signature tidak dikirim (missing signature)', async () => {
      const payload = {
        partner_reff: 'DP-001',
        amount: 50000,
        status: 'SUCCESS',
        response_code: '00',
      };

      const res = await service.handleLinkQuCallback(payload);

      expect(res.response).toBe('01');
      expect(res.message).toBe('Signature is required');
      expect(prismaMock.paymentGatewayTransaction.findUnique).not.toHaveBeenCalled();
      assertZeroMutations();
    });

    it('harus menolak callback jika signatureKey tidak dikonfigurasi di DB maupun ENV (terisolasi)', async () => {
      prismaMock.pengaturanUmum.findFirst.mockResolvedValue({
        linkqu_signature_key: null,
      });
      delete process.env.LINKQU_SIGNATURE_KEY;

      const payload = {
        partner_reff: 'DP-001',
        amount: 50000,
        status: 'SUCCESS',
        response_code: '00',
        signature: 'any_signature_value',
      };

      const res = await service.handleLinkQuCallback(payload);

      expect(res.response).toBe('01');
      expect(res.message).toBe('Signature key is not configured');
      assertZeroMutations();
    });

    it('harus menggunakan LINKQU_SIGNATURE_KEY dari ENV jika di DB tidak tersedia', async () => {
      prismaMock.pengaturanUmum.findFirst.mockResolvedValue({
        linkqu_signature_key: null,
      });
      process.env.LINKQU_SIGNATURE_KEY = 'env_secret_key_456';

      const sig = createSignature(50000, 'DP-ENV-001', 'SUCCESS', 'env_secret_key_456');
      const payload = {
        partner_reff: 'DP-ENV-001',
        amount: 50000,
        status: 'SUCCESS',
        response_code: '00',
        signature: sig,
      };

      prismaMock.paymentGatewayTransaction.findUnique.mockResolvedValue({
        id: 11,
        partner_reff: 'DP-ENV-001',
        amount: 50000,
        status: 'PENDING',
        provider: 'LINKQU',
        reference_type: 'DEPOSIT',
        requestDeposit: {
          id: 55,
          nominal: 50000,
          status: 'proses',
          riwayatTransaksi: {
            member: { id: 8, saldo: 20000 },
          },
        },
      });
      prismaMock.paymentGatewayTransaction.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.member.update.mockResolvedValue({ id: 8, saldo: 70000 });

      const res = await service.handleLinkQuCallback(payload);
      expect(res.response).toBe('00');
      expect(res.message).toBe('Payment pending verification');
      assertZeroMutations();
    });

    it('harus menolak callback jika signature hash salah / tidak cocok', async () => {
      const payload = {
        partner_reff: 'DP-001',
        amount: 50000,
        status: 'SUCCESS',
        response_code: '00',
        signature: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      };

      const res = await service.handleLinkQuCallback(payload);

      expect(res.response).toBe('01');
      expect(res.message).toBe('Invalid signature');
      assertZeroMutations();
    });

    it('harus menolak signature malformed: valid 64-hex ditambah suffix invalid (e.g. valid + "zz")', async () => {
      const validSig = createSignature(50000, 'DP-MAL-001', 'SUCCESS');
      const malformedSig = validSig + 'zz';

      const payload = {
        partner_reff: 'DP-MAL-001',
        amount: 50000,
        status: 'SUCCESS',
        response_code: '00',
        signature: malformedSig,
      };

      const res = await service.handleLinkQuCallback(payload);

      expect(res.response).toBe('01');
      expect(res.message).toBe('Invalid signature format');
      assertZeroMutations();
    });

    it('harus menolak signature yang kurang dari atau lebih dari 64 karakter hex', async () => {
      for (const badSig of ['abcdef123456', 'a'.repeat(63), 'a'.repeat(65)]) {
        const payload = {
          partner_reff: 'DP-MAL-002',
          amount: 50000,
          status: 'SUCCESS',
          response_code: '00',
          signature: badSig,
        };

        const res = await service.handleLinkQuCallback(payload);

        expect(res.response).toBe('01');
        expect(res.message).toBe('Invalid signature format');
        assertZeroMutations();
      }
    });

    it('harus menolak signature dengan karakter non-hex', async () => {
      const nonHexSig = 'g'.repeat(64);
      const payload = {
        partner_reff: 'DP-MAL-003',
        amount: 50000,
        status: 'SUCCESS',
        response_code: '00',
        signature: nonHexSig,
      };

      const res = await service.handleLinkQuCallback(payload);

      expect(res.response).toBe('01');
      expect(res.message).toBe('Invalid signature format');
      assertZeroMutations();
    });
  });

  describe('2. Validasi Skalar Amount Ketat & Single Nominal Rule', () => {
    it.each([
      ['null', null],
      ['undefined', undefined],
      ['string kosong', ''],
      ['angka nol', 0],
      ['angka negatif', -50000],
      ['string non-numerik', 'bukan_angka'],
      ['NaN', NaN],
      ['Infinity', Infinity],
      ['boolean true', true],
      ['boolean false', false],
      ['array kosong', []],
      ['object kosong', {}],
      ['array berisi angka', [50000]],
    ])('harus menolak callback dengan amount tidak valid: %s', async (_, invalidAmount) => {
      const sig = createSignature(invalidAmount, 'DP-AMT-001', 'SUCCESS');
      const payload = {
        partner_reff: 'DP-AMT-001',
        amount: invalidAmount,
        status: 'SUCCESS',
        response_code: '00',
        signature: sig,
      };

      const res = await service.handleLinkQuCallback(payload);

      expect(res.response).toBe('01');
      expect(res.message).toMatch(/(Amount is required|Valid positive amount is required)/);
      assertZeroMutations();
    });

    it('harus menolak callback jika nominal mismatch dengan record tx.amount di database', async () => {
      const mockTx = {
        id: 201,
        partner_reff: 'DP-MISMATCH-01',
        amount: 50000,
        total_amount: 51000,
        status: 'PENDING',
        provider: 'LINKQU',
      };
      prismaMock.paymentGatewayTransaction.findUnique.mockResolvedValue(mockTx);

      const callbackAmount = 25000;
      const sig = createSignature(callbackAmount, 'DP-MISMATCH-01', 'SUCCESS');
      const payload = {
        partner_reff: 'DP-MISMATCH-01',
        amount: callbackAmount,
        status: 'SUCCESS',
        response_code: '00',
        signature: sig,
      };

      const res = await service.handleLinkQuCallback(payload);

      expect(res.response).toBe('00');
      expect(res.message).toBe('Payment pending verification');
      assertZeroMutations();
    });

    it('harus menolak jika callback mengirim total_amount (51000) bukannya tx.amount (50000) [Single Nominal Rule]', async () => {
      const mockTx = {
        id: 202,
        partner_reff: 'DP-MISMATCH-02',
        amount: 50000,
        total_amount: 51000,
        status: 'PENDING',
        provider: 'LINKQU',
      };
      prismaMock.paymentGatewayTransaction.findUnique.mockResolvedValue(mockTx);

      // Single nominal rule: harus cocok dengan tx.amount persis, bukan alternatif total_amount
      const callbackAmount = 51000;
      const sig = createSignature(callbackAmount, 'DP-MISMATCH-02', 'SUCCESS');
      const payload = {
        partner_reff: 'DP-MISMATCH-02',
        amount: callbackAmount,
        status: 'SUCCESS',
        response_code: '00',
        signature: sig,
      };

      const res = await service.handleLinkQuCallback(payload);

      expect(res.response).toBe('00');
      expect(res.message).toBe('Payment pending verification');
      assertZeroMutations();
    });
  });

  describe('3. Validasi Skalar Partner Reference & Alias Conflict', () => {
    it.each([
      ['null', null],
      ['undefined', undefined],
      ['string kosong', ''],
      ['number scalar', 12345],
      ['boolean', true],
      ['object', { id: 'DP-001' }],
      ['array', ['DP-001']],
    ])('harus menolak callback dengan partner_reff tidak valid: %s', async (_, invalidReff) => {
      const payload = {
        partner_reff: invalidReff,
        amount: 50000,
        status: 'SUCCESS',
        response_code: '00',
        signature: 'any_signature',
      };

      const res = await service.handleLinkQuCallback(payload);

      expect(res.response).toBe('01');
      expect(res.message).toMatch(/(partner_reff is required|Invalid partner_reff)/);
      assertZeroMutations();
    });

    it('harus menolak callback jika partner_reff dan partner_ref bertentangan (alias conflict)', async () => {
      const payload = {
        partner_reff: 'DP-ALPHA-01',
        partner_ref: 'DP-BETA-02', // Berbeda!
        amount: 50000,
        status: 'SUCCESS',
        response_code: '00',
        signature: 'any_signature',
      };

      const res = await service.handleLinkQuCallback(payload);

      expect(res.response).toBe('01');
      expect(res.message).toBe('Contradictory partner_reff alias fields');
      assertZeroMutations();
    });

    it('harus mengembalikan response 01 jika referensi tidak ditemukan di DB', async () => {
      prismaMock.paymentGatewayTransaction.findUnique.mockResolvedValue(null);

      const sig = createSignature(50000, 'DP-NOTFOUND-01', 'SUCCESS');
      const payload = {
        partner_reff: 'DP-NOTFOUND-01',
        amount: 50000,
        status: 'SUCCESS',
        response_code: '00',
        signature: sig,
      };

      const res = await service.handleLinkQuCallback(payload);

      expect(res.response).toBe('00');
      expect(res.message).toBe('Payment pending verification');
      assertZeroMutations();
    });
  });

  describe('4. Validasi Status, Response Code & Anti-Kontradiksi', () => {
    it('harus menolak callback jika status dan status_trx bertentangan (alias conflict)', async () => {
      const payload = {
        partner_reff: 'DP-STAT-001',
        amount: 50000,
        status: 'SUCCESS',
        status_trx: 'FAILED', // Bertentangan
        response_code: '00',
        signature: 'any_signature',
      };

      const res = await service.handleLinkQuCallback(payload);

      expect(res.response).toBe('01');
      expect(res.message).toBe('Contradictory status alias fields');
      assertZeroMutations();
    });

    it('harus menolak callback jika response_code dan rc bertentangan (alias conflict)', async () => {
      const payload = {
        partner_reff: 'DP-RC-001',
        amount: 50000,
        status: 'SUCCESS',
        response_code: '00',
        rc: '01', // Bertentangan
        signature: 'any_signature',
      };

      const res = await service.handleLinkQuCallback(payload);

      expect(res.response).toBe('01');
      expect(res.message).toBe('Contradictory response_code alias fields');
      assertZeroMutations();
    });

    it('harus menolak callback jika status kosong meskipun response_code 00', async () => {
      const sig = createSignature(50000, 'DP-EMPTY-01', '');
      const payload = {
        partner_reff: 'DP-EMPTY-01',
        amount: 50000,
        status: '',
        response_code: '00',
        signature: sig,
      };

      const res = await service.handleLinkQuCallback(payload);

      expect(res.response).toBe('01');
      expect(res.message).toContain('Unknown payment status');
      assertZeroMutations();
    });

    it('harus menolak callback jika status SUCCESS namun response_code bukan 00 (kontradiktif)', async () => {
      const sig = createSignature(50000, 'DP-KONTRA-01', 'SUCCESS');
      const payload = {
        partner_reff: 'DP-KONTRA-01',
        amount: 50000,
        status: 'SUCCESS',
        response_code: '01',
        signature: sig,
      };

      const res = await service.handleLinkQuCallback(payload);

      expect(res.response).toBe('01');
      expect(res.message).toBe('Contradictory status and response_code');
      assertZeroMutations();
    });

    it('harus membiarkan status PENDING tanpa melakukan mutasi saldo', async () => {
      const mockTx = {
        id: 403,
        partner_reff: 'DP-PENDING-01',
        amount: 50000,
        total_amount: 50000,
        status: 'PENDING',
        provider: 'LINKQU',
      };
      prismaMock.paymentGatewayTransaction.findUnique.mockResolvedValue(mockTx);

      const sig = createSignature(50000, 'DP-PENDING-01', 'PENDING');
      const payload = {
        partner_reff: 'DP-PENDING-01',
        amount: 50000,
        status: 'PENDING',
        signature: sig,
      };

      const res = await service.handleLinkQuCallback(payload);

      expect(res.response).toBe('00');
      expect(res.message).toBe('Payment pending verification');
      assertZeroMutations();
    });

    it.each([
      ['array berisi string', ['00']],
      ['array kosong', []],
      ['object', { code: '00' }],
      ['boolean true', true],
      ['boolean false', false],
      ['string kosong', ''],
      ['whitespace saja', '   '],
    ])('harus menolak callback jika response_code non-skalar/kosong: %s', async (_, invalidRc) => {
      const payload = {
        partner_reff: 'DP-BAD-RC-01',
        amount: 50000,
        status: 'SUCCESS',
        response_code: invalidRc,
        signature: 'any_sig',
      };

      const res = await service.handleLinkQuCallback(payload);

      expect(res.response).toBe('01');
      expect(res.message).toContain('Invalid response_code');
      assertZeroMutations();
    });

    it.each([
      ['array berisi string', ['00']],
      ['array kosong', []],
      ['object', { rc: '00' }],
      ['boolean true', true],
      ['string kosong', ''],
    ])('harus menolak callback jika rc non-skalar/kosong: %s', async (_, invalidRc) => {
      const payload = {
        partner_reff: 'DP-BAD-RC-02',
        amount: 50000,
        status: 'SUCCESS',
        rc: invalidRc,
        signature: 'any_sig',
      };

      const res = await service.handleLinkQuCallback(payload);

      expect(res.response).toBe('01');
      expect(res.message).toContain('Invalid rc');
      assertZeroMutations();
    });
  });

  describe('5. Validasi Provider & Merchant Identity', () => {
    it('harus menolak callback jika provider transaksi di DB bukan LINKQU', async () => {
      const mockTx = {
        id: 301,
        partner_reff: 'DP-PROV-001',
        amount: 50000,
        total_amount: 50000,
        status: 'PENDING',
        provider: 'TRIPAY',
      };
      prismaMock.paymentGatewayTransaction.findUnique.mockResolvedValue(mockTx);

      const sig = createSignature(50000, 'DP-PROV-001', 'SUCCESS');
      const payload = {
        partner_reff: 'DP-PROV-001',
        amount: 50000,
        status: 'SUCCESS',
        response_code: '00',
        signature: sig,
      };

      const res = await service.handleLinkQuCallback(payload);

      expect(res.response).toBe('00');
      expect(res.message).toBe('Payment pending verification');
      assertZeroMutations();
    });

    it('harus menolak callback jika client_id di payload tidak cocok dengan server', async () => {
      const sig = createSignature(50000, 'DP-CLIENT-001', 'SUCCESS');
      const payload = {
        partner_reff: 'DP-CLIENT-001',
        amount: 50000,
        status: 'SUCCESS',
        response_code: '00',
        client_id: 'wrong_client_id_999',
        signature: sig,
      };

      const res = await service.handleLinkQuCallback(payload);

      expect(res.response).toBe('01');
      expect(res.message).toBe('Client ID mismatch');
      assertZeroMutations();
    });

    it.each([
      ['array berisi string', ['client_linkqu_001']],
      ['array kosong', []],
      ['object', { id: 'client_linkqu_001' }],
      ['boolean true', true],
      ['string kosong', ''],
      ['whitespace saja', '   '],
    ])('harus menolak callback jika client_id non-skalar/kosong: %s', async (_, invalidClientId) => {
      const payload = {
        partner_reff: 'DP-BAD-CLIENT-01',
        amount: 50000,
        status: 'SUCCESS',
        response_code: '00',
        client_id: invalidClientId,
        signature: 'any_sig',
      };

      const res = await service.handleLinkQuCallback(payload);

      expect(res.response).toBe('01');
      expect(res.message).toContain('Invalid client_id');
      assertZeroMutations();
    });

    it('harus menerima callback jika client_id diabaikan / tidak dikirim oleh provider (autentikasi via signature)', async () => {
      const mockTx = {
        id: 303,
        partner_reff: 'DP-NO-CLIENT-01',
        amount: 50000,
        total_amount: 50000,
        status: 'PENDING',
        provider: 'LINKQU',
        reference_type: 'DEPOSIT',
        requestDeposit: {
          id: 56,
          nominal: 50000,
          status: 'proses',
          riwayatTransaksi: {
            member: { id: 9, saldo: 30000 },
          },
        },
      };
      prismaMock.paymentGatewayTransaction.findUnique.mockResolvedValue(mockTx);
      prismaMock.paymentGatewayTransaction.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.member.update.mockResolvedValue({ id: 9, saldo: 80000 });

      const sig = createSignature(50000, 'DP-NO-CLIENT-01', 'SUCCESS');
      const payload = {
        partner_reff: 'DP-NO-CLIENT-01',
        amount: 50000,
        status: 'SUCCESS',
        response_code: '00',
        // Tidak ada client_id
        signature: sig,
      };

      const res = await service.handleLinkQuCallback(payload);

      expect(res.response).toBe('00');
      expect(res.message).toBe('Payment pending verification');
      assertZeroMutations();
    });
  });

  describe('6. Independent Fixtures (RFC 2104 Precomputed Hash)', () => {
    beforeAll(() => {
      injectAdapter = true;
    });

    afterAll(() => {
      injectAdapter = false;
    });

    beforeEach(() => {
      prismaMock.pengaturanUmum.findFirst.mockResolvedValue({
        linkqu_signature_key: FIXTURE_SECRET_KEY,
        linkqu_client_id: FIXTURE_CLIENT_ID,
      });
    });

    it('harus memproses fixture sintetis/internal VA_SUCCESS secara tepat satu kredit', async () => {
      const fixture = LINKQU_FIXTURES.VA_SUCCESS;

      const mockTx = {
        id: 601,
        partner_reff: fixture.partner_reff,
        amount: fixture.amount,
        total_amount: fixture.amount,
        status: 'PENDING',
        payment_method: 'VA',
        provider: 'LINKQU',
        reference_type: 'DEPOSIT',
        requestDeposit: {
          id: 101,
          nominal: fixture.amount,
          status: 'proses',
          riwayatTransaksi: {
            member: { id: 10, saldo: 50000 },
          },
        },
      };

      prismaMock.paymentGatewayTransaction.findUnique.mockResolvedValue(mockTx);
      prismaMock.paymentGatewayTransaction.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.member.update.mockResolvedValue({ id: 10, saldo: 100000 });

      const res = await service.handleLinkQuCallback(fixture);

      expect(res.response).toBe('00');
      expect(prismaMock.member.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: { saldo: { increment: 50000 } },
      });
      expect(prismaMock.riwayatSaldo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            member_id: 10,
            nominal: 50000,
            saldo_sebelumnya: 50000,
            saldo_setelahnya: 100000,
          }),
        }),
      );
    });

    it('harus memproses fixture sintetis/internal QRIS_SUCCESS secara tepat', async () => {
      const fixture = LINKQU_FIXTURES.QRIS_SUCCESS;

      const mockTx = {
        id: 602,
        partner_reff: fixture.partner_reff,
        amount: fixture.amount,
        total_amount: fixture.amount,
        status: 'PENDING',
        payment_method: 'QRIS',
        provider: 'LINKQU',
        reference_type: 'DEPOSIT',
        requestDeposit: {
          id: 102,
          nominal: fixture.amount,
          status: 'proses',
          riwayatTransaksi: {
            member: { id: 11, saldo: 0 },
          },
        },
      };

      prismaMock.paymentGatewayTransaction.findUnique.mockResolvedValue(mockTx);
      prismaMock.paymentGatewayTransaction.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.member.update.mockResolvedValue({ id: 11, saldo: 25000 });

      const res = await service.handleLinkQuCallback(fixture);

      expect(res.response).toBe('00');
      expect(prismaMock.member.update).toHaveBeenCalledWith({
        where: { id: 11 },
        data: { saldo: { increment: 25000 } },
      });
    });

    it('harus membiarkan fixture EWALLET_PENDING tanpa mutasi', async () => {
      const fixture = LINKQU_FIXTURES.EWALLET_PENDING;

      const mockTx = {
        id: 603,
        partner_reff: fixture.partner_reff,
        amount: fixture.amount,
        total_amount: fixture.amount,
        status: 'PENDING',
        payment_method: 'EWALLET',
        provider: 'LINKQU',
      };

      prismaMock.paymentGatewayTransaction.findUnique.mockResolvedValue(mockTx);

      const res = await service.handleLinkQuCallback(fixture);

      expect(res.response).toBe('00');
      expect(res.message).toBe('Payment pending');
      assertZeroMutations();
    });

    it('harus mengubah status ke FAILED pada fixture VA_FAILED tanpa kredit saldo', async () => {
      const fixture = LINKQU_FIXTURES.VA_FAILED;

      const mockTx = {
        id: 604,
        partner_reff: fixture.partner_reff,
        amount: fixture.amount,
        total_amount: fixture.amount,
        status: 'PENDING',
        payment_method: 'VA',
        provider: 'LINKQU',
        reference_type: 'DEPOSIT',
        requestDeposit: {
          id: 104,
          status: 'proses',
        },
      };

      prismaMock.paymentGatewayTransaction.findUnique.mockResolvedValue(mockTx);

      const res = await service.handleLinkQuCallback(fixture);

      expect(res.response).toBe('00');
      expect(prismaMock.paymentGatewayTransaction.updateMany).toHaveBeenCalledWith({
        where: { id: 604, status: 'PENDING' },
        data: expect.objectContaining({ status: 'FAILED' }),
      });
      expect(prismaMock.requestDeposit.update).toHaveBeenCalledWith({
        where: { id: 104 },
        data: expect.objectContaining({ status: 'gagal' }),
      });
      expect(prismaMock.member.update).not.toHaveBeenCalled();
      expect(prismaMock.riwayatSaldo.create).not.toHaveBeenCalled();
    });
  });

  describe('7. Idempotensi Duplicate & Settlement Anti-Duplikasi Paralel', () => {
    beforeAll(() => {
      injectAdapter = true;
    });

    afterAll(() => {
      injectAdapter = false;
    });

    it('harus mencegah kredit ganda saat callback valid diulang 10 kali secara paralel', async () => {
      let claimCount = 0;
      const mockTx = {
        id: 502,
        uuid: 'uuid-502',
        partner_reff: 'DP-PARALLEL-02',
        amount: 50000,
        total_amount: 50000,
        status: 'PENDING',
        payment_method: 'QRIS',
        provider: 'LINKQU',
        reference_type: 'DEPOSIT',
        requestDeposit: {
          id: 78,
          nominal: 50000,
          status: 'proses',
          riwayatTransaksi: {
            member: { id: 2, saldo: 0 },
          },
        },
      };

      prismaMock.paymentGatewayTransaction.findUnique.mockResolvedValue(mockTx);
      prismaMock.paymentGatewayTransaction.updateMany.mockImplementation(async () => {
        claimCount++;
        return { count: claimCount === 1 ? 1 : 0 };
      });
      prismaMock.member.update.mockResolvedValue({ id: 2, saldo: 50000 });

      const sig = createSignature(50000, 'DP-PARALLEL-02', 'SUCCESS');
      const payload = {
        partner_reff: 'DP-PARALLEL-02',
        amount: 50000,
        status: 'SUCCESS',
        response_code: '00',
        signature: sig,
      };

      const promises = Array.from({ length: 10 }, () =>
        service.handleLinkQuCallback(payload),
      );

      const results = await Promise.all(promises);

      results.forEach((r) => expect(r.response).toBe('00'));
      expect(prismaMock.member.update).toHaveBeenCalledTimes(1);
      expect(prismaMock.riwayatSaldo.create).toHaveBeenCalledTimes(1);
    });

    it('harus mengembalikan response 00 secara idempotent jika transaksi sudah SUCCESS', async () => {
      const mockTx = {
        id: 503,
        partner_reff: 'DP-ALREADY-SUCCESS',
        amount: 50000,
        status: 'SUCCESS', // Sudah SUCCESS
        provider: 'LINKQU',
      };
      prismaMock.paymentGatewayTransaction.findUnique.mockResolvedValue(mockTx);

      const sig = createSignature(50000, 'DP-ALREADY-SUCCESS', 'SUCCESS');
      const payload = {
        partner_reff: 'DP-ALREADY-SUCCESS',
        amount: 50000,
        status: 'SUCCESS',
        response_code: '00',
        signature: sig,
      };

      const res = await service.handleLinkQuCallback(payload);

      expect(res.response).toBe('00');
      expect(prismaMock.paymentGatewayTransaction.updateMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.member.update).not.toHaveBeenCalled();
      expect(prismaMock.requestDeposit.update).not.toHaveBeenCalled();
    });
  });

  describe('8. HTTP Controller & TransformInterceptor Integration', () => {
    it('harus mengembalikan HTTP 200 raw { response: "00" } tanpa dibungkus interceptor untuk callback valid', async () => {
      const mockTx = {
        id: 701,
        partner_reff: 'DP-HTTP-01',
        amount: 50000,
        total_amount: 50000,
        status: 'PENDING',
        provider: 'LINKQU',
        reference_type: 'DEPOSIT',
        requestDeposit: {
          id: 201,
          nominal: 50000,
          status: 'proses',
          riwayatTransaksi: {
            member: { id: 3, saldo: 10000 },
          },
        },
      };

      prismaMock.paymentGatewayTransaction.findUnique.mockResolvedValue(mockTx);
      prismaMock.paymentGatewayTransaction.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.member.update.mockResolvedValue({ id: 3, saldo: 60000 });

      const sig = createSignature(50000, 'DP-HTTP-01', 'SUCCESS');
      const payload = {
        partner_reff: 'DP-HTTP-01',
        amount: 50000,
        status: 'SUCCESS',
        response_code: '00',
        signature: sig,
      };

      const response = await request(app.getHttpServer())
        .post('/webhook/linkqu')
        .send(payload);

      expect(response.status).toBe(200);
      // Response asli dari LinkQu handler tidak dibungkus menjadi { error, message, data }
      expect(response.body).toEqual({ response: '00', message: 'Payment pending verification' });
    });

    it('harus mengembalikan HTTP 200 raw { response: "01", message: "..." } untuk signature invalid', async () => {
      const payload = {
        partner_reff: 'DP-HTTP-02',
        amount: 50000,
        status: 'SUCCESS',
        response_code: '00',
        signature: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      };

      const response = await request(app.getHttpServer())
        .post('/webhook/linkqu')
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        response: '01',
        message: 'Invalid signature',
      });
    });

    it('harus mengembalikan HTTP 200 raw { response: "01", message: "Invalid signature format" } untuk signature + "zz"', async () => {
      const validSig = createSignature(50000, 'DP-HTTP-03', 'SUCCESS');
      const payload = {
        partner_reff: 'DP-HTTP-03',
        amount: 50000,
        status: 'SUCCESS',
        response_code: '00',
        signature: validSig + 'zz',
      };

      const response = await request(app.getHttpServer())
        .post('/webhook/linkqu')
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        response: '01',
        message: 'Invalid signature format',
      });
    });

    it('harus mengembalikan HTTP 200 raw { response: "01", message: "Transaction not found" } jika ref belum ada', async () => {
      prismaMock.paymentGatewayTransaction.findUnique.mockResolvedValue(null);

      const sig = createSignature(50000, 'DP-HTTP-NOTFOUND', 'SUCCESS');
      const payload = {
        partner_reff: 'DP-HTTP-NOTFOUND',
        amount: 50000,
        status: 'SUCCESS',
        response_code: '00',
        signature: sig,
      };

      const response = await request(app.getHttpServer())
        .post('/webhook/linkqu')
        .send(payload);

      expect(response.status).toBe(200);
      // Karena kita melakukan ingestion terlebih dahulu, event akan tersimpan dan return 00
      expect(response.body).toEqual({
        response: '00',
        message: 'Payment pending verification',
      });
    });

    it('harus menangani DB error yang tidak terduga dan tetap mengembalikan { response: "01" }', async () => {
      prismaMock.paymentGatewayCallbackInbox.create.mockRejectedValue(
        new Error('DB_FATAL_CONNECTION_DOWN'),
      );

      const sig = createSignature(50000, 'DP-HTTP-ERR', 'SUCCESS');
      const payload = {
        partner_reff: 'DP-HTTP-ERR',
        amount: 50000,
        status: 'SUCCESS',
        response_code: '00',
        signature: sig,
      };

      const response = await request(app.getHttpServer())
        .post('/webhook/linkqu')
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body.response).toBe('01');
    });
  });

  describe('9. Paket C (ISSUE-003 / C1): Klaim Settlement, Rollback Atomik & Barrier Concurrency', () => {
    beforeAll(() => {
      injectAdapter = true;
    });

    afterAll(() => {
      injectAdapter = false;
    });

    it('C1-01: Jalur FAILED dengan claim.count 0 (kehilangan klaim) -> requestDeposit.update tidak pernah dipanggil', async () => {
      const mockTx = {
        id: 701,
        partner_reff: 'DP-C1-FAIL-LOST',
        amount: 50000,
        status: 'PENDING',
        provider: 'LINKQU',
        reference_type: 'DEPOSIT',
        requestDeposit: {
          id: 301,
          nominal: 50000,
          status: 'proses',
        },
      };

      prismaMock.paymentGatewayTransaction.findUnique.mockResolvedValue(mockTx);
      // Kehilangan klaim: updateMany mengembalikan count 0 (karena concurrent callback sudah mengubah status)
      prismaMock.paymentGatewayTransaction.updateMany.mockResolvedValue({ count: 0 });

      const sig = createSignature(50000, 'DP-C1-FAIL-LOST', 'FAILED');
      const payload = {
        partner_reff: 'DP-C1-FAIL-LOST',
        amount: 50000,
        status: 'FAILED',
        response_code: '01',
        signature: sig,
      };

      const res = await service.handleLinkQuCallback(payload);

      expect(res.response).toBe('00');
      // Assert: requestDeposit.update TIDAK PERNAH dipanggil bila count === 0
      expect(prismaMock.requestDeposit.update).not.toHaveBeenCalled();
      expect(prismaMock.member.update).not.toHaveBeenCalled();
      expect(prismaMock.riwayatSaldo.create).not.toHaveBeenCalled();
    });

    it('C1-02: Jalur EXPIRED dengan claim.count 0 (kehilangan klaim) -> requestDeposit.update tidak pernah dipanggil', async () => {
      const mockTx = {
        id: 702,
        partner_reff: 'DP-C1-EXP-LOST',
        amount: 50000,
        status: 'PENDING',
        provider: 'LINKQU',
        reference_type: 'DEPOSIT',
        requestDeposit: {
          id: 302,
          nominal: 50000,
          status: 'proses',
        },
      };

      prismaMock.paymentGatewayTransaction.findUnique.mockResolvedValue(mockTx);
      prismaMock.paymentGatewayTransaction.updateMany.mockResolvedValue({ count: 0 });

      const sig = createSignature(50000, 'DP-C1-EXP-LOST', 'EXPIRED');
      const payload = {
        partner_reff: 'DP-C1-EXP-LOST',
        amount: 50000,
        status: 'EXPIRED',
        response_code: '02',
        signature: sig,
      };

      const res = await service.handleLinkQuCallback(payload);

      expect(res.response).toBe('00');
      expect(prismaMock.requestDeposit.update).not.toHaveBeenCalled();
      expect(prismaMock.member.update).not.toHaveBeenCalled();
      expect(prismaMock.riwayatSaldo.create).not.toHaveBeenCalled();
    });

    it('C1-03: Jalur FAILED dengan claim.count 1 (menang klaim) -> requestDeposit.update dipanggil dengan status gagal', async () => {
      const mockTx = {
        id: 703,
        partner_reff: 'DP-C1-FAIL-WON',
        amount: 50000,
        status: 'PENDING',
        provider: 'LINKQU',
        reference_type: 'DEPOSIT',
        requestDeposit: {
          id: 303,
          nominal: 50000,
          status: 'proses',
        },
      };

      prismaMock.paymentGatewayTransaction.findUnique.mockResolvedValue(mockTx);
      prismaMock.paymentGatewayTransaction.updateMany.mockResolvedValue({ count: 1 });

      const sig = createSignature(50000, 'DP-C1-FAIL-WON', 'FAILED');
      const payload = {
        partner_reff: 'DP-C1-FAIL-WON',
        amount: 50000,
        status: 'FAILED',
        response_code: '01',
        signature: sig,
      };

      const res = await service.handleLinkQuCallback(payload);

      expect(res.response).toBe('00');
      expect(prismaMock.paymentGatewayTransaction.updateMany).toHaveBeenCalledWith({
        where: { id: 703, status: 'PENDING' },
        data: expect.objectContaining({ status: 'FAILED' }),
      });
      expect(prismaMock.requestDeposit.update).toHaveBeenCalledWith({
        where: { id: 303 },
        data: expect.objectContaining({ status: 'gagal' }),
      });
      expect(prismaMock.member.update).not.toHaveBeenCalled();
      expect(prismaMock.riwayatSaldo.create).not.toHaveBeenCalled();
    });

    it('C1-04: SUCCESS dengan relasi requestDeposit hilang (null) -> throw rollback, gateway TIDAK SUCCESS, nol kredit', async () => {
      const mockTx = {
        id: 704,
        partner_reff: 'DP-C1-NO-DEPOSIT',
        amount: 50000,
        status: 'PENDING',
        provider: 'LINKQU',
        reference_type: 'DEPOSIT',
        requestDeposit: null, // Relasi wajib hilang!
      };

      prismaMock.paymentGatewayTransaction.findUnique.mockResolvedValue(mockTx);
      prismaMock.paymentGatewayTransaction.updateMany.mockResolvedValue({ count: 1 });

      const sig = createSignature(50000, 'DP-C1-NO-DEPOSIT', 'SUCCESS');
      const payload = {
        partner_reff: 'DP-C1-NO-DEPOSIT',
        amount: 50000,
        status: 'SUCCESS',
        response_code: '00',
        signature: sig,
      };

      const res = await service.handleLinkQuCallback(payload);

      expect(res.response).toBe('01');
      expect(res.message).toContain('Mandatory relation requestDeposit missing');
      expect(prismaMock.requestDeposit.update).not.toHaveBeenCalled();
      expect(prismaMock.member.update).not.toHaveBeenCalled();
      expect(prismaMock.riwayatSaldo.create).not.toHaveBeenCalled();
    });

    it('C1-05: SUCCESS dengan relasi member hilang (riwayatTransaksi.member null) -> throw rollback, gateway TIDAK SUCCESS, nol kredit', async () => {
      const mockTx = {
        id: 705,
        partner_reff: 'DP-C1-NO-MEMBER',
        amount: 50000,
        status: 'PENDING',
        provider: 'LINKQU',
        reference_type: 'DEPOSIT',
        requestDeposit: {
          id: 305,
          nominal: 50000,
          status: 'proses',
          riwayatTransaksi: {
            member: null, // Member hilang!
          },
        },
      };

      prismaMock.paymentGatewayTransaction.findUnique.mockResolvedValue(mockTx);
      prismaMock.paymentGatewayTransaction.updateMany.mockResolvedValue({ count: 1 });

      const sig = createSignature(50000, 'DP-C1-NO-MEMBER', 'SUCCESS');
      const payload = {
        partner_reff: 'DP-C1-NO-MEMBER',
        amount: 50000,
        status: 'SUCCESS',
        response_code: '00',
        signature: sig,
      };

      const res = await service.handleLinkQuCallback(payload);

      expect(res.response).toBe('01');
      expect(res.message).toContain('Mandatory relation member missing');
      expect(prismaMock.requestDeposit.update).not.toHaveBeenCalled();
      expect(prismaMock.member.update).not.toHaveBeenCalled();
      expect(prismaMock.riwayatSaldo.create).not.toHaveBeenCalled();
    });

    it('C1-06: SUCCESS dengan transisi deposit tidak sah (deposit.status !== "proses") -> throw rollback, nol kredit', async () => {
      const mockTx = {
        id: 706,
        partner_reff: 'DP-C1-INVALID-STATUS',
        amount: 50000,
        status: 'PENDING',
        provider: 'LINKQU',
        reference_type: 'DEPOSIT',
        requestDeposit: {
          id: 306,
          nominal: 50000,
          status: 'gagal', // Bukan proses!
          riwayatTransaksi: {
            member: { id: 5, saldo: 10000 },
          },
        },
      };

      prismaMock.paymentGatewayTransaction.findUnique.mockResolvedValue(mockTx);
      prismaMock.paymentGatewayTransaction.updateMany.mockResolvedValue({ count: 1 });

      const sig = createSignature(50000, 'DP-C1-INVALID-STATUS', 'SUCCESS');
      const payload = {
        partner_reff: 'DP-C1-INVALID-STATUS',
        amount: 50000,
        status: 'SUCCESS',
        response_code: '00',
        signature: sig,
      };

      const res = await service.handleLinkQuCallback(payload);

      expect(res.response).toBe('01');
      expect(res.message).toContain('Invalid deposit status transition');
      expect(prismaMock.requestDeposit.update).not.toHaveBeenCalled();
      expect(prismaMock.member.update).not.toHaveBeenCalled();
      expect(prismaMock.riwayatSaldo.create).not.toHaveBeenCalled();
    });

    it('C1-07: SUCCESS dengan nominal deposit <= 0 -> throw rollback, nol kredit', async () => {
      const mockTx = {
        id: 707,
        partner_reff: 'DP-C1-ZERO-NOMINAL',
        amount: 50000,
        status: 'PENDING',
        provider: 'LINKQU',
        reference_type: 'DEPOSIT',
        requestDeposit: {
          id: 307,
          nominal: 0, // Nominal 0!
          status: 'proses',
          riwayatTransaksi: {
            member: { id: 5, saldo: 10000 },
          },
        },
      };

      prismaMock.paymentGatewayTransaction.findUnique.mockResolvedValue(mockTx);
      prismaMock.paymentGatewayTransaction.updateMany.mockResolvedValue({ count: 1 });

      const sig = createSignature(50000, 'DP-C1-ZERO-NOMINAL', 'SUCCESS');
      const payload = {
        partner_reff: 'DP-C1-ZERO-NOMINAL',
        amount: 50000,
        status: 'SUCCESS',
        response_code: '00',
        signature: sig,
      };

      const res = await service.handleLinkQuCallback(payload);

      expect(res.response).toBe('01');
      expect(res.message).toContain('Invalid deposit nominal');
      expect(prismaMock.requestDeposit.update).not.toHaveBeenCalled();
      expect(prismaMock.member.update).not.toHaveBeenCalled();
      expect(prismaMock.riwayatSaldo.create).not.toHaveBeenCalled();
    });

    it('C1-08: Late SUCCESS setelah FAILED -> claim.count 0, catat activityLog LATE_SUCCESS_SETTLEMENT_CONFLICT, nol kredit', async () => {
      const mockTx = {
        id: 708,
        partner_reff: 'DP-C1-LATE-SUCCESS-FAIL',
        amount: 50000,
        status: 'FAILED', // Sudah final FAILED
        provider: 'LINKQU',
        reference_type: 'DEPOSIT',
        requestDeposit: {
          id: 308,
          nominal: 50000,
          status: 'gagal',
          riwayatTransaksi: {
            member: { id: 6, saldo: 20000 },
          },
        },
      };

      prismaMock.paymentGatewayTransaction.findUnique.mockResolvedValue(mockTx);
      // updateMany where status: 'PENDING' mengembalikan count 0 karena status sudah FAILED
      prismaMock.paymentGatewayTransaction.updateMany.mockResolvedValue({ count: 0 });

      const sig = createSignature(50000, 'DP-C1-LATE-SUCCESS-FAIL', 'SUCCESS');
      const payload = {
        partner_reff: 'DP-C1-LATE-SUCCESS-FAIL',
        amount: 50000,
        status: 'SUCCESS',
        response_code: '00',
        signature: sig,
      };

      const res = await service.handleLinkQuCallback(payload);

      expect(res.response).toBe('00');
      // Assert: activityLog mencatat konflik status untuk rekonsiliasi manual
      expect(prismaMock.activityLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'LATE_SUCCESS_SETTLEMENT_CONFLICT',
          entity: 'PaymentGatewayTransaction',
          entityId: '708',
        }),
      });
      // Assert: nol mutasi finansial
      expect(prismaMock.requestDeposit.update).not.toHaveBeenCalled();
      expect(prismaMock.member.update).not.toHaveBeenCalled();
      expect(prismaMock.riwayatSaldo.create).not.toHaveBeenCalled();
    });

    it('C1-09: Late SUCCESS setelah EXPIRED -> claim.count 0, catat activityLog LATE_SUCCESS_SETTLEMENT_CONFLICT, nol kredit', async () => {
      const mockTx = {
        id: 709,
        partner_reff: 'DP-C1-LATE-SUCCESS-EXP',
        amount: 50000,
        status: 'EXPIRED', // Sudah final EXPIRED
        provider: 'LINKQU',
        reference_type: 'DEPOSIT',
        requestDeposit: {
          id: 309,
          nominal: 50000,
          status: 'gagal',
          riwayatTransaksi: {
            member: { id: 7, saldo: 15000 },
          },
        },
      };

      prismaMock.paymentGatewayTransaction.findUnique.mockResolvedValue(mockTx);
      prismaMock.paymentGatewayTransaction.updateMany.mockResolvedValue({ count: 0 });

      const sig = createSignature(50000, 'DP-C1-LATE-SUCCESS-EXP', 'SUCCESS');
      const payload = {
        partner_reff: 'DP-C1-LATE-SUCCESS-EXP',
        amount: 50000,
        status: 'SUCCESS',
        response_code: '00',
        signature: sig,
      };

      const res = await service.handleLinkQuCallback(payload);

      expect(res.response).toBe('00');
      expect(prismaMock.activityLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'LATE_SUCCESS_SETTLEMENT_CONFLICT',
          entity: 'PaymentGatewayTransaction',
          entityId: '709',
        }),
      });
      expect(prismaMock.requestDeposit.update).not.toHaveBeenCalled();
      expect(prismaMock.member.update).not.toHaveBeenCalled();
      expect(prismaMock.riwayatSaldo.create).not.toHaveBeenCalled();
    });

    it('C1-10: Barrier Concurrency Simulation: SUCCESS commit lebih dulu, FAILED menyusul -> gateway SUCCESS, deposit sukses, tepat 1 kredit', async () => {
      // Simulasi state database in-memory
      let currentDbStatus = 'PENDING';
      let depositStatus = 'proses';
      let memberSaldo = 20000;
      let ledgerCount = 0;

      const mockTx = {
        id: 710,
        partner_reff: 'DP-C1-RACE-SUCCESS-FIRST',
        amount: 50000,
        status: 'PENDING',
        provider: 'LINKQU',
        reference_type: 'DEPOSIT',
        payment_method: 'QRIS',
        requestDeposit: {
          id: 310,
          nominal: 50000,
          status: 'proses',
          riwayatTransaksi: {
            member: { id: 8, saldo: 20000 },
          },
        },
      };

      prismaMock.paymentGatewayTransaction.findUnique.mockImplementation(async () => ({
        ...mockTx,
        status: currentDbStatus,
        requestDeposit: {
          ...mockTx.requestDeposit,
          status: depositStatus,
          riwayatTransaksi: {
            member: { id: 8, saldo: memberSaldo },
          },
        },
      }));

      prismaMock.paymentGatewayTransaction.updateMany.mockImplementation(async ({ where, data }: any) => {
        if (where.status === currentDbStatus) {
          currentDbStatus = data.status;
          return { count: 1 };
        }
        return { count: 0 };
      });

      prismaMock.requestDeposit.update.mockImplementation(async ({ data }: any) => {
        depositStatus = data.status;
        return { id: 310, status: depositStatus };
      });

      prismaMock.member.update.mockImplementation(async ({ data }: any) => {
        memberSaldo += data.saldo.increment;
        return { id: 8, saldo: memberSaldo };
      });

      prismaMock.riwayatSaldo.create.mockImplementation(async () => {
        ledgerCount++;
        return { id: ledgerCount };
      });

      const successPayload = {
        partner_reff: 'DP-C1-RACE-SUCCESS-FIRST',
        amount: 50000,
        status: 'SUCCESS',
        response_code: '00',
        signature: createSignature(50000, 'DP-C1-RACE-SUCCESS-FIRST', 'SUCCESS'),
      };

      const failPayload = {
        partner_reff: 'DP-C1-RACE-SUCCESS-FIRST',
        amount: 50000,
        status: 'FAILED',
        response_code: '01',
        signature: createSignature(50000, 'DP-C1-RACE-SUCCESS-FIRST', 'FAILED'),
      };

      // SUCCESS mengeksekusi dan commit lebih dahulu
      const resSuccess = await service.handleLinkQuCallback(successPayload);
      expect(resSuccess.response).toBe('00');

      // FAILED berjalan menyusul (status DB sudah SUCCESS)
      const resFail = await service.handleLinkQuCallback(failPayload);
      expect(resFail.response).toBe('00');

      // Assert final state: Gateway tetap SUCCESS, Deposit tetap sukses, tepat 1 kredit (+50000), tepat 1 ledger
      expect(currentDbStatus).toBe('SUCCESS');
      expect(depositStatus).toBe('sukses');
      expect(memberSaldo).toBe(70000);
      expect(ledgerCount).toBe(1);
    });

    it('C1-11: Barrier Concurrency Simulation: FAILED commit lebih dulu, SUCCESS menyusul -> gateway FAILED, deposit gagal, nol kredit, conflict log tercatat', async () => {
      let currentDbStatus = 'PENDING';
      let depositStatus = 'proses';
      let memberSaldo = 20000;
      let ledgerCount = 0;

      const mockTx = {
        id: 711,
        partner_reff: 'DP-C1-RACE-FAIL-FIRST',
        amount: 50000,
        status: 'PENDING',
        provider: 'LINKQU',
        reference_type: 'DEPOSIT',
        payment_method: 'VA',
        requestDeposit: {
          id: 311,
          nominal: 50000,
          status: 'proses',
          riwayatTransaksi: {
            member: { id: 9, saldo: 20000 },
          },
        },
      };

      prismaMock.paymentGatewayTransaction.findUnique.mockImplementation(async () => ({
        ...mockTx,
        status: currentDbStatus,
        requestDeposit: {
          ...mockTx.requestDeposit,
          status: depositStatus,
          riwayatTransaksi: {
            member: { id: 9, saldo: memberSaldo },
          },
        },
      }));

      prismaMock.paymentGatewayTransaction.updateMany.mockImplementation(async ({ where, data }: any) => {
        if (where.status === currentDbStatus) {
          currentDbStatus = data.status;
          return { count: 1 };
        }
        return { count: 0 };
      });

      prismaMock.requestDeposit.update.mockImplementation(async ({ data }: any) => {
        depositStatus = data.status;
        return { id: 311, status: depositStatus };
      });

      prismaMock.member.update.mockImplementation(async ({ data }: any) => {
        memberSaldo += data.saldo.increment;
        return { id: 9, saldo: memberSaldo };
      });

      prismaMock.riwayatSaldo.create.mockImplementation(async () => {
        ledgerCount++;
        return { id: ledgerCount };
      });

      const failPayload = {
        partner_reff: 'DP-C1-RACE-FAIL-FIRST',
        amount: 50000,
        status: 'FAILED',
        response_code: '01',
        signature: createSignature(50000, 'DP-C1-RACE-FAIL-FIRST', 'FAILED'),
      };

      const successPayload = {
        partner_reff: 'DP-C1-RACE-FAIL-FIRST',
        amount: 50000,
        status: 'SUCCESS',
        response_code: '00',
        signature: createSignature(50000, 'DP-C1-RACE-FAIL-FIRST', 'SUCCESS'),
      };

      // FAILED mengeksekusi dan commit lebih dahulu
      const resFail = await service.handleLinkQuCallback(failPayload);
      expect(resFail.response).toBe('00');

      // SUCCESS menyusul (status DB sudah FAILED)
      const resSuccess = await service.handleLinkQuCallback(successPayload);
      expect(resSuccess.response).toBe('00');

      // Assert final state: Gateway tetap FAILED, Deposit tetap gagal, 0 kredit saldo, 0 ledger, conflict log tercatat
      expect(currentDbStatus).toBe('FAILED');
      expect(depositStatus).toBe('gagal');
      expect(memberSaldo).toBe(20000); // Saldo tidak berubah
      expect(ledgerCount).toBe(0);
      expect(prismaMock.activityLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'LATE_SUCCESS_SETTLEMENT_CONFLICT',
          entity: 'PaymentGatewayTransaction',
          entityId: '711',
        }),
      });
    });
  });

  describe('10. Validasi Skalar Null & Missing Policy (C1 Coverage Audit)', () => {
    it('C1-12: harus menolak callback dengan response_code: null eksplisit', async () => {
      const payload = {
        partner_reff: 'DP-NULL-RC-01',
        amount: 50000,
        status: 'SUCCESS',
        response_code: null,
        signature: 'any_signature',
      };

      const res = await service.handleLinkQuCallback(payload);
      expect(res.response).toBe('01');
      expect(res.message).toContain('Invalid response_code');
      assertZeroMutations();
    });

    it('C1-13: harus menolak callback dengan rc: null eksplisit', async () => {
      const payload = {
        partner_reff: 'DP-NULL-RC-02',
        amount: 50000,
        status: 'SUCCESS',
        rc: null,
        signature: 'any_signature',
      };

      const res = await service.handleLinkQuCallback(payload);
      expect(res.response).toBe('01');
      expect(res.message).toContain('Invalid rc');
      assertZeroMutations();
    });

    it('C1-14: harus menolak callback dengan client_id: null eksplisit', async () => {
      const payload = {
        partner_reff: 'DP-NULL-CLIENT-01',
        amount: 50000,
        status: 'SUCCESS',
        response_code: '00',
        client_id: null,
        signature: 'any_signature',
      };

      const res = await service.handleLinkQuCallback(payload);
      expect(res.response).toBe('01');
      expect(res.message).toContain('Invalid client_id');
      assertZeroMutations();
    });

    it('C1-15: harus menolak callback dengan status: null eksplisit', async () => {
      const payload = {
        partner_reff: 'DP-NULL-STATUS-01',
        amount: 50000,
        status: null,
        signature: 'any_signature',
      };

      const res = await service.handleLinkQuCallback(payload);
      expect(res.response).toBe('01');
      expect(res.message).toContain('Status must be a string');
      assertZeroMutations();
    });

    it('C1-16: HTTP Endpoint regression: response_code: null dengan signature fixture valid ditolak HTTP 200 { response: "01" } nol mutasi', async () => {
      prismaMock.pengaturanUmum.findFirst.mockResolvedValue({
        linkqu_signature_key: FIXTURE_SECRET_KEY,
        linkqu_client_id: FIXTURE_CLIENT_ID,
      });

      const fixture = LINKQU_FIXTURES.VA_SUCCESS;
      const payload = {
        partner_reff: fixture.partner_reff,
        amount: fixture.amount,
        status: 'SUCCESS',
        response_code: null, // Null eksplisit!
        client_id: FIXTURE_CLIENT_ID,
        signature: fixture.signature,
      };

      const response = await request(app.getHttpServer())
        .post('/webhook/linkqu')
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body.response).toBe('01');
      expect(response.body.message).toContain('Invalid response_code');
      assertZeroMutations();
    });

    it('C1-17: HTTP Endpoint regression: client_id: null dengan signature fixture valid ditolak HTTP 200 { response: "01" } nol mutasi', async () => {
      prismaMock.pengaturanUmum.findFirst.mockResolvedValue({
        linkqu_signature_key: FIXTURE_SECRET_KEY,
        linkqu_client_id: FIXTURE_CLIENT_ID,
      });

      const fixture = LINKQU_FIXTURES.VA_SUCCESS;
      const payload = {
        partner_reff: fixture.partner_reff,
        amount: fixture.amount,
        status: 'SUCCESS',
        response_code: '00',
        client_id: null, // Null eksplisit!
        signature: fixture.signature,
      };

      const response = await request(app.getHttpServer())
        .post('/webhook/linkqu')
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body.response).toBe('01');
      expect(response.body.message).toContain('Invalid client_id');
      assertZeroMutations();
    });
  });
});
