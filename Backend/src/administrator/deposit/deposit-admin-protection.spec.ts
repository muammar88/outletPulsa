import { Test, TestingModule } from '@nestjs/testing';
import { DepositService } from './deposit.service';
import { PrismaService } from '../../prisma.service';
import { PengumumanService } from '../../pengumuman/pengumuman.service';
import { SocketService } from '../../socket/socket.service';
import { BadRequestException } from '@nestjs/common';

describe('C2 Admin Protection: Prohibition of Manual Approval for Payment Gateway Deposits', () => {
  let service: DepositService;
  let prismaMock: any;

  beforeEach(async () => {
    prismaMock = {
      requestDeposit: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      member: {
        update: jest.fn(),
      },
      riwayatSaldo: {
        create: jest.fn(),
      },
      $transaction: jest.fn(async (cb) => cb(prismaMock)),
    };

    const dummyPengumuman = {
      sendPengumuman: jest.fn().mockReturnValue({ catch: jest.fn() }),
    };
    const dummySocket = {
      emitBalanceUpdated: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepositService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: PengumumanService, useValue: dummyPengumuman },
        { provide: SocketService, useValue: dummySocket },
      ],
    }).compile();

    service = module.get<DepositService>(DepositService);
  });

  it('C2-ADMIN-01: Menolak persetujuan manual jika deposit terikat dengan paymentGatewayTransaction PENDING', async () => {
    prismaMock.requestDeposit.findFirst.mockResolvedValue({
      id: 50,
      status: 'proses',
      nominal: 100000,
      paymentGatewayTransaction: {
        provider: 'LINKQU',
        partner_reff: 'DEP-LINKQU-001',
        status: 'PENDING',
      },
      riwayatTransaksi: {
        member: { id: 1, saldo: 50000 },
      },
    });

    await expect(
      service.updateStatus(50, { status: 'sukses' }, 1),
    ).rejects.toThrow(BadRequestException);

    // Pastikan tidak ada mutasi saldo maupun update deposit ke sukses
    expect(prismaMock.requestDeposit.update).not.toHaveBeenCalled();
    expect(prismaMock.member.update).not.toHaveBeenCalled();
    expect(prismaMock.riwayatSaldo.create).not.toHaveBeenCalled();
  });

  it('C2-ADMIN-02: Menolak persetujuan manual jika deposit terikat dengan paymentGatewayTransaction SUCCESS', async () => {
    prismaMock.requestDeposit.findFirst.mockResolvedValue({
      id: 51,
      status: 'proses',
      nominal: 75000,
      paymentGatewayTransaction: {
        provider: 'LINKQU',
        partner_reff: 'DEP-LINKQU-002',
        status: 'SUCCESS',
      },
      riwayatTransaksi: {
        member: { id: 2, saldo: 20000 },
      },
    });

    await expect(
      service.updateStatus(51, { status: 'sukses' }, 1),
    ).rejects.toThrow(BadRequestException);

    expect(prismaMock.requestDeposit.update).not.toHaveBeenCalled();
    expect(prismaMock.member.update).not.toHaveBeenCalled();
  });

  it('C2-ADMIN-03: Menolak persetujuan manual jika deposit terikat dengan tripayReference', async () => {
    prismaMock.requestDeposit.findFirst.mockResolvedValue({
      id: 52,
      status: 'proses',
      nominal: 50000,
      tripayReference: 'DEV-TRIPAY-999',
      paymentGatewayTransaction: null,
      riwayatTransaksi: {
        member: { id: 3, saldo: 10000 },
      },
    });

    await expect(
      service.updateStatus(52, { status: 'sukses' }, 1),
    ).rejects.toThrow(BadRequestException);

    expect(prismaMock.requestDeposit.update).not.toHaveBeenCalled();
    expect(prismaMock.member.update).not.toHaveBeenCalled();
  });

  it('C2-ADMIN-04: Mengizinkan persetujuan manual untuk deposit transfer bank reguler (tanpa gateway)', async () => {
    prismaMock.requestDeposit.findFirst.mockResolvedValue({
      id: 53,
      status: 'proses',
      nominal: 200000,
      nominalTambahan: 123,
      paymentGatewayTransaction: null,
      tripayReference: null,
      riwayatTransaksiId: 100,
      riwayatTransaksi: {
        member: { id: 4, saldo: 50000 },
      },
    });
    prismaMock.requestDeposit.update.mockResolvedValue({ id: 53, status: 'sukses' });
    prismaMock.member.update.mockResolvedValue({ id: 4, saldo: 250123 });
    prismaMock.riwayatSaldo.create.mockResolvedValue({ id: 1001 });

    const result = await service.updateStatus(100, { status: 'sukses' }, 1);
    expect(result.status).toBe('sukses');
    expect(prismaMock.requestDeposit.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'sukses' } }),
    );
    expect(prismaMock.member.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { saldo: 250123 } }),
    );
    expect(prismaMock.riwayatSaldo.create).toHaveBeenCalled();
  });
});
