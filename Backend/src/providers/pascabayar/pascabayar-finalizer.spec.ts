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
    });
    prisma.transactionPascabayar.updateMany.mockResolvedValue({ count: 1 });

    const res = await finalizer.finalizeSuccess({
      transactionId: 2,
      sn: 'SN-2',
      actualProviderAdminFee: 2000,
      source: 'TEST',
    });

    expect(res.applied).toBe(true);
    const data = prisma.transactionPascabayar.updateMany.mock.calls[0][0].data;
    expect(data.serial_number).toBe('SN-2');
    expect(data.laba).toBe(12500 - 10000 - 2000 + 500);
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

    const res = await finalizer.finalizeFailure({ transactionId: 3, reason: 'Gagal', source: 'TEST' });

    expect(res.applied).toBe(true);
    expect(res.refunded).toBe(true);
    expect(prisma.member.update).toHaveBeenCalledWith({ where: { id: 9 }, data: { saldo: 50000 } });
    const ledger = prisma.riwayatSaldo.create.mock.calls[0][0].data;
    expect(ledger.status).toBe('pengembalian_dana');
    expect(ledger.saldo_sebelumnya).toBe(37500);
    expect(ledger.saldo_setelahnya).toBe(50000);
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
});

