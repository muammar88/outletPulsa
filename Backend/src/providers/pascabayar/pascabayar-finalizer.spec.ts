import { PascabayarFinalizerService } from './pascabayar-finalizer.service';

function buildPrisma(overrides: any = {}) {
  const prisma: any = {
    transactionPascabayar: {
      findUnique: jest.fn(),
      updateMany: jest.fn(),
      update: jest.fn(),
    },
    member: { findUnique: jest.fn(), update: jest.fn() },
    riwayatSaldo: { create: jest.fn() },
    riwayatTransaksi: { findUnique: jest.fn(), create: jest.fn() },
    ...overrides,
  };
  prisma.$transaction = jest.fn(async (cb: any) => cb(prisma));
  return prisma;
}

const pengumuman = { sendTransactionStatus: jest.fn().mockResolvedValue(undefined) } as any;
const socket = { emitTransactionUpdated: jest.fn() } as any;

describe('PascabayarFinalizerService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('menolak finalisasi sukses bila pembayaran belum diklaim/debit belum tercatat', async () => {
    const prisma = buildPrisma();
    const finalizer = new PascabayarFinalizerService(prisma, pengumuman, socket);
    prisma.transactionPascabayar.findUnique.mockResolvedValue({
      id: 9,
      status: 'proses',
      memberId: 9,
      trId: 'PSC-9',
      nominal: 10000,
      total: 12500,
      comissionSnapshot: 0,
      serial_number: null,
      providerRefId: null,
      paymentAttemptedAt: null,
      saldo_sebelum: null,
    });

    const res = await finalizer.finalizeSuccess({ transactionId: 9, sn: 'SN', source: 'STATUS_CHECK' });
    expect(res.applied).toBe(false);
    expect(prisma.transactionPascabayar.updateMany).not.toHaveBeenCalled();
  });

  it('finalisasi sukses hanya diterapkan sekali (idempotent)', async () => {
    const prisma = buildPrisma();
    const finalizer = new PascabayarFinalizerService(prisma, pengumuman, socket);
    prisma.transactionPascabayar.findUnique.mockResolvedValue({
      id: 1,
      status: 'sukses',
      memberId: 9,
      trId: 'PSC-1',
      nomorTujuan: '123',
      nominal: 10000,
      total: 12500,
      comissionSnapshot: 0,
      serial_number: null,
      providerRefId: null,
    });

    const res = await finalizer.finalizeSuccess({ transactionId: 1, sn: 'SN', source: 'TEST' });
    expect(res.applied).toBe(false);
    expect(prisma.transactionPascabayar.updateMany).not.toHaveBeenCalled();
  });

  it('finalisasi sukses menyimpan SN dan laba saat semua komponen diketahui', async () => {
    const prisma = buildPrisma();
    const finalizer = new PascabayarFinalizerService(prisma, pengumuman, socket);
    prisma.transactionPascabayar.findUnique.mockResolvedValue({
      id: 2,
      status: 'proses',
      memberId: 9,
      trId: 'PSC-2',
      nomorTujuan: '123',
      nominal: 10000,
      total: 12500,
      comissionSnapshot: 500,
      serial_number: null,
      providerRefId: null,
      paymentAttemptedAt: new Date(),
    });
    prisma.transactionPascabayar.updateMany.mockResolvedValue({ count: 1 });

    const res = await finalizer.finalizeSuccess({
      transactionId: 2,
      sn: 'SN-2',
      actualProviderAdminFee: 2000,
      providerCost: 11000,
      providerBillRef: 'BILLER-2',
      source: 'TEST',
    });

    expect(res.applied).toBe(true);
    const data = prisma.transactionPascabayar.updateMany.mock.calls[0][0].data;
    expect(data.serial_number).toBe('SN-2');
    expect(data.noref).toBe('BILLER-2');
    // Laba kotor = total didebit - biaya aktual provider (komisi tidak ditambah lagi).
    expect(data.laba).toBe(12500 - 11000);
  });

  it('kegagalan notifikasi setelah commit tidak mengubah hasil sukses', async () => {
    const prisma = buildPrisma();
    const finalizer = new PascabayarFinalizerService(prisma, pengumuman, socket);
    prisma.transactionPascabayar.findUnique.mockResolvedValue({
      id: 21,
      status: 'proses',
      memberId: 9,
      trId: 'PSC-21',
      nomorTujuan: '123',
      nominal: 10000,
      total: 12500,
      serial_number: null,
      providerRefId: null,
      paymentAttemptedAt: new Date(),
    });
    prisma.transactionPascabayar.updateMany.mockResolvedValue({ count: 1 });
    (pengumuman.sendTransactionStatus as jest.Mock).mockRejectedValueOnce(new Error('WA down'));

    const res = await finalizer.finalizeSuccess({ transactionId: 21, sn: 'SN-21', source: 'TEST' });

    expect(res.applied).toBe(true);
    expect(res.status).toBe('sukses');
    expect(pengumuman.sendTransactionStatus).toHaveBeenCalledTimes(2);
  });

  it('kegagalan socket tidak menghalangi pengiriman pengumuman', async () => {
    const prisma = buildPrisma();
    const finalizer = new PascabayarFinalizerService(prisma, pengumuman, socket);
    prisma.transactionPascabayar.findUnique.mockResolvedValue({
      id: 22,
      status: 'proses',
      memberId: 9,
      trId: 'PSC-22',
      nomorTujuan: '123',
      nominal: 10000,
      total: 12500,
      serial_number: null,
      providerRefId: null,
      paymentAttemptedAt: new Date(),
    });
    prisma.transactionPascabayar.updateMany.mockResolvedValue({ count: 1 });
    (socket.emitTransactionUpdated as jest.Mock).mockImplementationOnce(() => {
      throw new Error('socket down');
    });

    const res = await finalizer.finalizeSuccess({ transactionId: 22, sn: 'SN-22', source: 'TEST' });

    expect(res.applied).toBe(true);
    expect(pengumuman.sendTransactionStatus).toHaveBeenCalledTimes(1);
  });

  it('notifikasi yang tetap gagal berhenti setelah tiga percobaan tanpa membatalkan transaksi', async () => {
    const prisma = buildPrisma();
    const finalizer = new PascabayarFinalizerService(prisma, pengumuman, socket);
    prisma.transactionPascabayar.findUnique.mockResolvedValue({
      id: 23,
      status: 'proses',
      memberId: 9,
      trId: 'PSC-23',
      nomorTujuan: '123',
      nominal: 10000,
      total: 12500,
      serial_number: null,
      providerRefId: null,
      paymentAttemptedAt: new Date(),
    });
    prisma.transactionPascabayar.updateMany.mockResolvedValue({ count: 1 });
    (pengumuman.sendTransactionStatus as jest.Mock)
      .mockRejectedValueOnce(new Error('push down 1'))
      .mockRejectedValueOnce(new Error('push down 2'))
      .mockRejectedValueOnce(new Error('push down 3'));

    const res = await finalizer.finalizeSuccess({ transactionId: 23, sn: 'SN-23', source: 'TEST' });

    expect(res).toEqual({ applied: true, status: 'sukses' });
    expect(pengumuman.sendTransactionStatus).toHaveBeenCalledTimes(3);
  });

  it('gagal definitif setelah debit melakukan tepat satu refund dengan ledger', async () => {
    const prisma = buildPrisma();
    const finalizer = new PascabayarFinalizerService(prisma, pengumuman, socket);
    prisma.transactionPascabayar.findUnique.mockResolvedValue({
      id: 3,
      status: 'proses',
      memberId: 9,
      trId: 'PSC-3',
      nomorTujuan: '123',
      total: 12500,
      saldo_sebelum: 50000,
      refundId: null,
      riwayatTransaksiId: 77,
    });
    prisma.transactionPascabayar.updateMany.mockResolvedValue({ count: 1 });
    prisma.member.findUnique.mockResolvedValue({ id: 9, saldo: 37500 });
    // Nilai saldo akhir berasal dari hasil UPDATE atomik, bukan dari hasil baca sebelumnya.
    prisma.member.update.mockResolvedValue({ saldo: 62000 });

    const res = await finalizer.finalizeFailure({ transactionId: 3, reason: 'Gagal', source: 'TEST' });

    expect(res.applied).toBe(true);
    expect(res.refunded).toBe(true);
    // Penambahan saldo harus atomik agar tidak menimpa transaksi lain yang berjalan bersamaan.
    expect(prisma.member.update).toHaveBeenCalledWith({
      where: { id: 9 },
      data: { saldo: { increment: 12500 } },
      select: { saldo: true },
    });
    const ledger = prisma.riwayatSaldo.create.mock.calls[0][0].data;
    expect(ledger.status).toBe('pengembalian_dana');
    expect(ledger.saldo_sebelumnya).toBe(49500);
    expect(ledger.saldo_setelahnya).toBe(62000);
  });

  it('refund memakai saldo hasil increment atomik walau ada perubahan saldo lain', async () => {
    const prisma = buildPrisma();
    const finalizer = new PascabayarFinalizerService(prisma, pengumuman, socket);
    prisma.transactionPascabayar.findUnique.mockResolvedValue({
      id: 6,
      status: 'proses',
      memberId: 9,
      trId: 'PSC-6',
      total: 10000,
      saldo_sebelum: 5000,
      refundId: null,
      riwayatTransaksiId: 88,
    });
    prisma.transactionPascabayar.updateMany.mockResolvedValue({ count: 1 });
    prisma.member.findUnique.mockResolvedValue({ id: 9, saldo: 1000 });
    // Saldo di DB sudah berubah karena topup lain setelah pembacaan.
    prisma.member.update.mockResolvedValue({ saldo: 26000 });

    await finalizer.finalizeFailure({ transactionId: 6, source: 'TEST' });

    const ledger = prisma.riwayatSaldo.create.mock.calls[0][0].data;
    expect(ledger.saldo_setelahnya).toBe(26000);
    expect(ledger.saldo_sebelumnya).toBe(16000);
  });

  it('tidak refund bila debit belum pernah terjadi', async () => {
    const prisma = buildPrisma();
    const finalizer = new PascabayarFinalizerService(prisma, pengumuman, socket);
    prisma.transactionPascabayar.findUnique.mockResolvedValue({
      id: 4,
      status: 'proses',
      memberId: 9,
      trId: 'PSC-4',
      total: 12500,
      saldo_sebelum: null,
      refundId: null,
      riwayatTransaksiId: null,
    });
    prisma.transactionPascabayar.updateMany.mockResolvedValue({ count: 1 });

    const res = await finalizer.finalizeFailure({ transactionId: 4, reason: 'Gagal', source: 'TEST' });
    expect(res.applied).toBe(true);
    expect(res.refunded).toBe(false);
    expect(prisma.member.update).not.toHaveBeenCalled();
  });

  it('tidak refund bila klaim gagal (sudah difinalisasi pihak lain)', async () => {
    const prisma = buildPrisma();
    const finalizer = new PascabayarFinalizerService(prisma, pengumuman, socket);
    prisma.transactionPascabayar.findUnique.mockResolvedValue({
      id: 5,
      status: 'proses',
      memberId: 9,
      total: 12500,
      saldo_sebelum: 100,
      refundId: null,
      riwayatTransaksiId: 1,
    });
    prisma.transactionPascabayar.updateMany.mockResolvedValue({ count: 0 });

    const res = await finalizer.finalizeFailure({ transactionId: 5, source: 'TEST' });
    expect(res.applied).toBe(false);
    expect(prisma.member.update).not.toHaveBeenCalled();
  });

  it('biaya inquiry tidak dipakai sebagai biaya aktual pembayaran', async () => {
    const prisma = buildPrisma();
    const finalizer = new PascabayarFinalizerService(prisma, pengumuman, socket);
    prisma.transactionPascabayar.findUnique.mockResolvedValue({
      id: 31,
      status: 'proses',
      memberId: 9,
      trId: 'PSC-31',
      nomorTujuan: '123',
      total: 12500,
      serial_number: null,
      providerRefId: null,
      paymentAttemptedAt: new Date(),
      inquiryPayload: { providerCost: 11000, providerAdminFee: 2000 },
    });
    prisma.transactionPascabayar.updateMany.mockResolvedValue({ count: 1 });

    const res = await finalizer.finalizeSuccess({ transactionId: 31, sn: 'SN-31', source: 'TEST' });

    expect(res.applied).toBe(true);
    const data = prisma.transactionPascabayar.updateMany.mock.calls[0][0].data;
    expect(data.laba).toBeUndefined();
    const payload = data.inquiryPayload;
    expect(payload.actualProviderCost).toBeUndefined();
    expect(payload.actualProviderAdminFee).toBeUndefined();
    expect(payload.estimatedProviderCost).toBe(11000);
    expect(payload.estimatedProviderAdminFee).toBe(2000);
  });
});
