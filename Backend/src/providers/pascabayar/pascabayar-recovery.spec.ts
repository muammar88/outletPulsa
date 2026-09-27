import { PascabayarRecoveryService, PASCA_STATUS_PERLU_MANUAL } from './pascabayar-recovery.service';

const baris = (overrides: Record<string, any> = {}) => ({
  id: 1,
  trId: 'PSC-1',
  provider: 'DIGIFLAZZ',
  providerSku: 'PLN-PASCA',
  nomorTujuan: '12345678901',
  inquiryPayload: { providerType: 'PLN' },
  status: 'proses',
  paymentAttemptedAt: new Date(),
  createdAt: new Date(Date.now() - 60_000),
  updatedAt: new Date(Date.now() - 120_000),
  ...overrides,
});

function buatService() {
  const prisma: any = {
    transactionPascabayar: {
      findMany: jest.fn().mockResolvedValue([]),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
  };
  const status = jest.fn();
  const router: any = { getAdapter: jest.fn().mockReturnValue({ status }) };
  const finalizer: any = {
    finalizeSuccess: jest.fn().mockResolvedValue({ applied: true, status: 'sukses' }),
    finalizeFailure: jest.fn().mockResolvedValue({ applied: true, status: 'gagal' }),
  };
  const service = new PascabayarRecoveryService(prisma, router, finalizer);
  return { service, prisma, router, status, finalizer };
}

describe('PascabayarRecoveryService', () => {
  it('hanya menyapu transaksi yang sudah pernah dicoba bayar dan belum terminal', async () => {
    const { service, prisma } = buatService();

    await service.recoverPending();

    const where = prisma.transactionPascabayar.findMany.mock.calls[0][0].where;
    expect(where.status).toBe('proses');
    expect(where.paymentAttemptedAt).toEqual({ not: null });
    expect(where.updatedAt.lte).toBeInstanceOf(Date);
    expect(where.OR).toEqual([{ providerStatus: null }, { providerStatus: { not: PASCA_STATUS_PERLU_MANUAL } }]);
  });

  it('finalisasi sukses memakai jalur finalizer bersama (idempotent)', async () => {
    const { service, prisma, status, finalizer } = buatService();
    prisma.transactionPascabayar.findMany.mockResolvedValue([baris()]);
    status.mockResolvedValue({
      status: 'sukses',
      definitiveFailure: false,
      rc: '00',
      message: 'sukses',
      sn: 'SN-1',
      providerRefId: 'TRX-PROV-1',
      actualBillAmount: 10000,
      actualProviderAdminFee: 2000,
    });

    const ringkasan = await service.recoverPending();

    expect(finalizer.finalizeSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ transactionId: 1, sn: 'SN-1', source: 'RECOVERY' }),
    );
    expect(finalizer.finalizeFailure).not.toHaveBeenCalled();
    expect(ringkasan.sukses).toBe(1);
  });

  it('kegagalan definitif direfund lewat finalizer, bukan ditulis manual', async () => {
    const { service, prisma, status, finalizer } = buatService();
    prisma.transactionPascabayar.findMany.mockResolvedValue([baris()]);
    status.mockResolvedValue({
      status: 'gagal',
      definitiveFailure: true,
      rc: '05',
      message: 'tagihan sudah dibayar',
      sn: null,
      providerRefId: null,
      actualBillAmount: null,
      actualProviderAdminFee: null,
    });

    const ringkasan = await service.recoverPending();

    expect(finalizer.finalizeFailure).toHaveBeenCalledWith(
      expect.objectContaining({ transactionId: 1, source: 'RECOVERY' }),
    );
    expect(finalizer.finalizeSuccess).not.toHaveBeenCalled();
    expect(ringkasan.gagal).toBe(1);
  });

  it('status ambigu dicatat sebagai percobaan dan tidak memicu refund', async () => {
    const { service, prisma, status, finalizer } = buatService();
    prisma.transactionPascabayar.findMany.mockResolvedValue([baris()]);
    status.mockResolvedValue({
      status: 'tidak_diketahui',
      definitiveFailure: false,
      rc: '',
      message: 'timeout',
      sn: null,
      providerRefId: null,
      actualBillAmount: null,
      actualProviderAdminFee: null,
    });

    const ringkasan = await service.recoverPending();

    expect(finalizer.finalizeSuccess).not.toHaveBeenCalled();
    expect(finalizer.finalizeFailure).not.toHaveBeenCalled();
    expect(prisma.transactionPascabayar.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1, status: 'proses' },
        data: expect.objectContaining({
          inquiryPayload: expect.objectContaining({ recoveryAttempts: 1 }),
        }),
      }),
    );
    expect(ringkasan.masihPending).toBe(1);
  });

  it('melewati batas percobaan menandai butuh penanganan manual tanpa memanggil provider', async () => {
    const { service, prisma, status, finalizer } = buatService();
    prisma.transactionPascabayar.findMany.mockResolvedValue([
      baris({ inquiryPayload: { recoveryAttempts: PascabayarRecoveryService.MAKS_PERCOBAAN } }),
    ]);

    const ringkasan = await service.recoverPending();

    expect(status).not.toHaveBeenCalled();
    expect(finalizer.finalizeFailure).not.toHaveBeenCalled();
    expect(prisma.transactionPascabayar.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ providerStatus: PASCA_STATUS_PERLU_MANUAL }),
      }),
    );
    expect(ringkasan.butuhPenangananManual).toBe(1);
  });

  it('transaksi lebih dari 3 hari tidak diofinalisasi otomatis', async () => {
    const { service, prisma, status, finalizer } = buatService();
    prisma.transactionPascabayar.findMany.mockResolvedValue([
      baris({ createdAt: new Date(Date.now() - PascabayarRecoveryService.MAKS_UMUR_MS - 60_000) }),
    ]);

    const ringkasan = await service.recoverPending();

    expect(status).not.toHaveBeenCalled();
    expect(finalizer.finalizeSuccess).not.toHaveBeenCalled();
    expect(finalizer.finalizeFailure).not.toHaveBeenCalled();
    expect(ringkasan.butuhPenangananManual).toBe(1);
  });

  it('error koneksi saat cek status tidak menghapus debit atau memicu refund', async () => {
    const { service, prisma, status, finalizer } = buatService();
    prisma.transactionPascabayar.findMany.mockResolvedValue([baris()]);
    status.mockRejectedValue(new Error('koneksi putus'));

    const ringkasan = await service.recoverPending();

    expect(finalizer.finalizeSuccess).not.toHaveBeenCalled();
    expect(finalizer.finalizeFailure).not.toHaveBeenCalled();
    expect(prisma.transactionPascabayar.updateMany).toHaveBeenCalled();
    expect(ringkasan.masihPending).toBe(1);
  });
});
