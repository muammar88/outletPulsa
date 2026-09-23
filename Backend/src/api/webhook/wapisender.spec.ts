import { Test, TestingModule } from '@nestjs/testing';
import { WebhookService } from './webhook.service';
import { PrismaService } from '../../prisma.service';
import { PengumumanService } from '../../pengumuman/pengumuman.service';
import { SocketService } from '../../socket/socket.service';
import { DaftarProdukDigiflazzService } from '../../administrator/daftar_produk_digiflazz/daftar_produk_digiflazz.service';
import { TransaksiFinalizerService } from '../transaksi/transaksi-finalizer.service';
import { WapisenderService } from '../../providers/wapisender.service';

describe('ISSUE-006: WapisenderService and WebhookService (WhatsApp)', () => {
  let webhookService: WebhookService;
  let wapisenderService: WapisenderService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      temp_registrasi: {
        findFirst: jest.fn(),
        updateMany: jest.fn(),
      },
      member: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      deviceConnected: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      webhookLog: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookService,
        WapisenderService,
        { provide: PrismaService, useValue: prisma },
        { provide: PengumumanService, useValue: { sendTransactionStatus: jest.fn() } },
        { provide: SocketService, useValue: { emitTransactionUpdated: jest.fn() } },
        { provide: DaftarProdukDigiflazzService, useValue: {} },
        { provide: TransaksiFinalizerService, useValue: {} },
      ],
    }).compile();

    webhookService = module.get<WebhookService>(WebhookService);
    wapisenderService = module.get<WapisenderService>(WapisenderService);
  });

  describe('Phone Normalization', () => {
    it('should normalize 08..., 8..., +628..., 628... consistently to 628...', () => {
      expect(wapisenderService.normalizePhone('081234567890')).toBe('6281234567890');
      expect(wapisenderService.normalizePhone('81234567890')).toBe('6281234567890');
      expect(wapisenderService.normalizePhone('+6281234567890')).toBe('6281234567890');
      expect(wapisenderService.normalizePhone('6281234567890')).toBe('6281234567890');
      expect(wapisenderService.normalizePhone('0812-3456-7890')).toBe('6281234567890');
    });
  });

  describe('WapisenderService Provider Rejection Handling', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = {
        ...originalEnv,
        WAPISENDER_API_KEY: 'test-api-key',
        WAPISENDER_DEVICE_KEY: 'test-device-key',
        WAPISENDER_URL: 'https://test.wapisender.id/api/message/send',
      };
    });

    afterEach(() => {
      process.env = originalEnv;
      jest.restoreAllMocks();
    });

    it('should report rejected when HTTP is 200 but body contains status: false', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ status: false, message: 'Device disconnected' }),
      } as any);

      const result = await wapisenderService.sendMessage('081234567890', 'Test message');
      expect(result.success).toBe(false);
      expect(result.status).toBe('rejected');
      expect(result.message).toBe('Device disconnected');
    });

    it('should report config_missing when credentials are empty', async () => {
      delete process.env.WAPISENDER_API_KEY;
      const result = await wapisenderService.sendMessage('081234567890', 'Test message');
      expect(result.success).toBe(false);
      expect(result.status).toBe('config_missing');
    });
  });

  describe('processWhatsappWebhook', () => {
    let sendSpy: jest.SpyInstance;

    beforeEach(() => {
      sendSpy = jest.spyOn(wapisenderService, 'sendMessage').mockResolvedValue({
        success: true,
        status: 'sent',
        message: 'Message sent',
      });
    });

    it('should ignore non-message events, bot own messages, and group messages', async () => {
      // Non-message event
      let res = await webhookService.processWhatsappWebhook({ event: 'status', phone: '081234567890' });
      expect(res.status).toBe('ignored');

      // from_me: true
      res = await webhookService.processWhatsappWebhook({
        event: 'message',
        phone: '081234567890',
        message: 'OP-1234',
        from_me: true,
      });
      expect(res.status).toBe('ignored');

      // is_group: true
      res = await webhookService.processWhatsappWebhook({
        event: 'message',
        phone: '081234567890',
        message: 'OP-1234',
        is_group: true,
      });
      expect(res.status).toBe('ignored');
      expect(sendSpy).not.toHaveBeenCalled();
    });

    it('should ignore duplicate event_id if already recorded in WebhookLog', async () => {
      prisma.webhookLog.findFirst.mockResolvedValue({ id: 1, transactionRef: 'EVT-999', status: 'success' });

      const res = await webhookService.processWhatsappWebhook({
        event: 'message',
        phone: '081234567890',
        message: 'OP-1234',
        event_id: 'EVT-999',
      });

      expect(res.status).toBe('ignored');
      expect(prisma.temp_registrasi.findFirst).not.toHaveBeenCalled();
      expect(sendSpy).not.toHaveBeenCalled();
    });

    it('should send warning and not create member when verification code is not found', async () => {
      prisma.webhookLog.findFirst.mockResolvedValue(null);
      prisma.temp_registrasi.findFirst.mockResolvedValue(null);

      const res = await webhookService.processWhatsappWebhook({
        event: 'message',
        phone: '081234567890',
        message: 'Halo verifikasi OP-9999 dong',
      });

      expect(res.success).toBe(false);
      expect(prisma.member.create).not.toHaveBeenCalled();
      expect(sendSpy).toHaveBeenCalledWith(
        '6281234567890',
        expect.stringContaining('kode verifikasi tidak ditemukan'),
      );
    });

    it('should reject and not create member when sender phone does not match registered phone', async () => {
      prisma.webhookLog.findFirst.mockResolvedValue(null);
      prisma.temp_registrasi.findFirst.mockResolvedValue({
        id: 1,
        whatsapp: '089999999999', // Different phone
        verification_code: 'OP-1234',
        status: 'unregistrated',
      });

      const res = await webhookService.processWhatsappWebhook({
        event: 'message',
        phone: '081234567890',
        message: 'OP-1234',
      });

      expect(res.success).toBe(false);
      expect(prisma.member.create).not.toHaveBeenCalled();
      expect(sendSpy).toHaveBeenCalledWith(
        '6281234567890',
        expect.stringContaining('nomor WhatsApp pengirim tidak cocok'),
      );
    });

    it('should register member atomically, link device, and send reply post-commit on success', async () => {
      prisma.webhookLog.findFirst.mockResolvedValue(null);
      prisma.temp_registrasi.findFirst.mockResolvedValue({
        id: 10,
        whatsapp: '081234567890',
        fullname: 'Budi Santoso',
        password: 'hashed-password',
        device_code: 'DEV-101',
        verification_code: 'OP-1234',
        status: 'unregistrated',
      });
      prisma.member.findFirst.mockResolvedValue(null);
      prisma.temp_registrasi.updateMany.mockResolvedValue({ count: 1 });
      prisma.member.create.mockResolvedValue({
        id: 55,
        kode: 'OP7788',
        fullname: 'Budi Santoso',
        whatsappnumber: '081234567890',
      });
      prisma.deviceConnected.findFirst.mockResolvedValue({ id: 1, device_code: 'DEV-101' });
      prisma.deviceConnected.update.mockResolvedValue({});
      prisma.webhookLog.create.mockResolvedValue({});

      const res = await webhookService.processWhatsappWebhook({
        event: 'message',
        phone: '+62812-3456-7890',
        message: 'OP-1234',
        event_id: 'EVT-001',
      });

      expect(res.message).toBe('Registrasi berhasil');
      expect(res.data.success).toBe(true);

      // Verify atomic claim
      expect(prisma.temp_registrasi.updateMany).toHaveBeenCalledWith({
        where: { id: 10, status: 'unregistrated' },
        data: { status: 'regitrated' },
      });

      // Verify member creation
      expect(prisma.member.create).toHaveBeenCalled();

      // Verify device update
      expect(prisma.deviceConnected.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { member_id: 55 },
      });

      // Verify WebhookLog recorded
      expect(prisma.webhookLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            provider: 'WAPISENDER',
            event: 'registration_verified',
            status: 'success',
          }),
        }),
      );

      // Verify reply sent POST-COMMIT
      expect(sendSpy).toHaveBeenCalledWith(
        '6281234567890',
        expect.stringContaining('Selamat! Registrasi Anda berhasil diproses'),
      );
    });

    it('should NOT send registration success message if DB transaction fails/rolls back', async () => {
      prisma.webhookLog.findFirst.mockResolvedValue(null);
      prisma.temp_registrasi.findFirst.mockResolvedValue({
        id: 10,
        whatsapp: '081234567890',
        fullname: 'Budi Santoso',
        verification_code: 'OP-1234',
        status: 'unregistrated',
      });
      prisma.member.findFirst.mockResolvedValue(null);
      prisma.temp_registrasi.updateMany.mockRejectedValue(new Error('DB_DEADLOCK'));

      const res = await webhookService.processWhatsappWebhook({
        event: 'message',
        phone: '081234567890',
        message: 'OP-1234',
      });

      expect(res.success).toBe(false);
      // No success message should have been sent
      expect(sendSpy).not.toHaveBeenCalledWith(
        '6281234567890',
        expect.stringContaining('Selamat! Registrasi Anda berhasil'),
      );
    });
  });
});
