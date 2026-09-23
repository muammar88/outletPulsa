import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { PengumumanService } from './pengumuman.service';
import { PrismaService } from '../prisma.service';
import { SocketService } from '../socket/socket.service';

// Mock firebase-admin/messaging
const mockSend = jest.fn();
jest.mock('firebase-admin/messaging', () => ({
  getMessaging: () => ({
    send: mockSend,
  }),
}));

describe('ISSUE-005: FCM Notifications & Device Token Lifecycle', () => {
  let service: PengumumanService;
  let mockPrisma: any;
  let mockSocket: any;

  beforeEach(async () => {
    mockSend.mockReset();

    mockSocket = {
      emitAnnouncement: jest.fn(),
    };

    mockPrisma = {
      pengumuman: {
        create: jest.fn().mockResolvedValue({ id: 1, title: 'Test', body: 'Body' }),
        update: jest.fn().mockImplementation((args) => Promise.resolve({ id: args.where.id, ...args.data })),
      },
      deviceConnected: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn().mockImplementation((args) => Promise.resolve({ id: 1, ...args.data })),
      },
      pengumumanRecipient: {
        create: jest.fn().mockResolvedValue({ id: 10 }),
        update: jest.fn().mockImplementation((args) => Promise.resolve({ id: args.where.id, ...args.data })),
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PengumumanService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: SocketService, useValue: mockSocket },
      ],
    }).compile();

    service = module.get<PengumumanService>(PengumumanService);
  });

  it('1. Semua penerima gagal / tidak ada token: status pengumuman dicatat "Failed", bukan "Success"', async () => {
    // User punya 1 device tanpa fcm_token
    mockPrisma.deviceConnected.findMany.mockResolvedValue([
      { id: 1, device_code: 'DEV-1', member_id: 5, fcm_token: null },
    ]);

    const result = await service.sendPengumuman({
      title: 'Promo',
      body: 'Diskon',
      pengumumanType: 'Promo',
      targetType: 'User',
      targetId: '5',
    });

    expect(result.status).toBe('Failed');
    expect(result.stats.success).toBe(0);
    expect(result.stats.failed).toBe(1);
    expect(mockPrisma.pengumuman.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'Failed' }),
      }),
    );
  });

  it('2. Satu sukses, satu gagal: status agregat pengumuman adalah "Success"', async () => {
    mockPrisma.deviceConnected.findMany.mockResolvedValue([
      { id: 1, device_code: 'DEV-1', member_id: 5, fcm_token: 'VALID-TOKEN-1' },
      { id: 2, device_code: 'DEV-2', member_id: 5, fcm_token: null },
    ]);

    mockSend.mockResolvedValue('msg-id-123');

    const result = await service.sendPengumuman({
      title: 'Info',
      body: 'Update',
      pengumumanType: 'Info',
      targetType: 'User',
      targetId: '5',
    });

    expect(result.status).toBe('Success');
    expect(result.stats.success).toBe(1);
    expect(result.stats.failed).toBe(1);
  });

  it('3. Token invalid: fcm_token dihapus dari deviceConnected agar tidak retry terus menerus', async () => {
    const error: any = new Error('Registration token is invalid');
    error.code = 'messaging/invalid-registration-token';
    mockSend.mockRejectedValue(error);

    const isSuccess = await service.processRecipientAndSend(
      { id: 1, title: 'Test', body: 'Body' },
      { id: 9, device_code: 'DEV-9', member_id: 3, fcm_token: 'DEAD-TOKEN' },
    );

    expect(isSuccess).toBe(false);
    expect(mockPrisma.deviceConnected.update).toHaveBeenCalledWith({
      where: { id: 9 },
      data: { fcm_token: null },
    });
    expect(mockPrisma.pengumumanRecipient.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'Failed',
          error_message: 'Invalid token removed',
        }),
      }),
    );
  });

  it('4. Member A mengirim device code milik Member B: Ditolak dengan ForbiddenException', async () => {
    // Device terikat pada member 99 (Member B)
    mockPrisma.deviceConnected.findUnique.mockResolvedValue({
      id: 5,
      device_code: 'DEV-B',
      member_id: 99,
      fcm_token: 'OLD-TOKEN',
    });

    // Member 10 (Member A) mencoba update token untuk device DEV-B
    await expect(
      service.updateFcmToken('DEV-B', 'ATTACKER-TOKEN', 10),
    ).rejects.toThrow(ForbiddenException);

    expect(mockPrisma.deviceConnected.update).not.toHaveBeenCalled();
  });

  it('5. Member mengupdate device miliknya sendiri dengan token valid: Berhasil', async () => {
    mockPrisma.deviceConnected.findUnique.mockResolvedValue({
      id: 5,
      device_code: 'DEV-MY',
      member_id: 10,
      fcm_token: 'OLD-TOKEN',
    });

    const res = await service.updateFcmToken('DEV-MY', 'NEW-VALID-FCM-TOKEN', 10);
    expect(res.status).toBe(true);
    expect(mockPrisma.deviceConnected.update).toHaveBeenCalledWith({
      where: { device_code: 'DEV-MY' },
      data: {
        fcm_token: 'NEW-VALID-FCM-TOKEN',
        member_id: 10,
      },
    });
  });

  it('6. Token kosong atau whitespace: Ditolak', async () => {
    const res = await service.updateFcmToken('DEV-MY', '   ', 10);
    expect(res.status).toBe(false);
    expect(res.message).toContain('tidak boleh kosong');
    expect(mockPrisma.deviceConnected.update).not.toHaveBeenCalled();
  });
});
