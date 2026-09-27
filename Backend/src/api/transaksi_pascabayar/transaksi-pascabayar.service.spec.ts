import { TransaksiPascabayarService } from './transaksi-pascabayar.service';

function buildDeps() {
  const prisma: any = {
    produkPascabayar: { findFirst: jest.fn(), findUnique: jest.fn() },
    transactionPascabayar: {
      create: jest.fn().mockResolvedValue({ id: 1 }),
      findFirst: jest.fn(),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      update: jest.fn().mockResolvedValue({}),
      findMany: jest.fn().mockResolvedValue([]),
    },
    member: {
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      findUnique: jest.fn().mockResolvedValue({ id: 7, saldo: 37500 }),
      update: jest.fn(),
    },
    riwayatTransaksi: { create: jest.fn().mockResolvedValue({ id: 55 }), findUnique: jest.fn() },
    riwayatSaldo: { create: jest.fn().mockResolvedValue({}) },
  };
  prisma.$transaction = jest.fn(async (cb: any) => cb(prisma));

  const adapter = { inquiry: jest.fn(), pay: jest.fn(), status: jest.fn() };
  const router = { getAdapter: jest.fn().mockReturnValue(adapter) };
  const selection = { resolveActive: jest.fn() };
  const finalizer = { finalizeSuccess: jest.fn(), finalizeFailure: jest.fn() };

  const service = new TransaksiPascabayarService(prisma, router as any, selection as any, finalizer as any);
  return { service, prisma, adapter, router, selection, finalizer };
}

const PRODUCT = { id: 1, kode: 'PLN-PASCA', name: 'PLN Pascabayar', fee: 2500, comission: 0, status: 'active' };

describe('TransaksiPascabayarService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('inquiry memakai SKU provider hasil pemetaan, bukan kode internal, dan tidak menyentuh saldo', async () => {
    const { service, prisma, adapter, selection } = buildDeps();
    prisma.produkPascabayar.findFirst.mockResolvedValue(PRODUCT);
    selection.resolveActive.mockResolvedValue({
      produkPascabayarId: 1,
      provider: 'IAK',
      providerSku: 'IAK-PLN-SKU',
      providerType: 'pln',
      explicit: true,
    });
    adapter.inquiry.mockResolvedValue({
      ok: true,
      billAmount: 100000,
      customerName: 'BUDI',
      providerAdminFee: 2500,
      providerCommission: 500,
      providerSellingPrice: 102500,
      period: 'AGUSTUS',
      rc: '00',
      detail: {},
    });

    const res = await service.inquiryPascabayar(7, 'PLN-PASCA', '12345');

    expect(adapter.inquiry).toHaveBeenCalledWith(expect.objectContaining({ sku: 'IAK-PLN-SKU', customerNo: '12345' }));
    const created = prisma.transactionPascabayar.create.mock.calls[0][0].data;
    expect(created.providerSku).toBe('IAK-PLN-SKU');
    expect(created.kode).toBe('PLN-PASCA');
    expect(created.memberId).toBe(7);
    expect(created.total).toBe(102500);
    expect(res.error).toBe(false);
    expect(res.data.nama_pelanggan).toBe('BUDI');
    expect(prisma.member.updateMany).not.toHaveBeenCalled();
  });

  it('inquiry ditolak bila produk belum terhubung provider', async () => {
    const { service, prisma, selection } = buildDeps();
    prisma.produkPascabayar.findFirst.mockResolvedValue(PRODUCT);
    selection.resolveActive.mockResolvedValue(null);
    const res = await service.inquiryPascabayar(7, 'PLN-PASCA', '12345');
    expect(res.error).toBe(true);
    expect(prisma.transactionPascabayar.create).not.toHaveBeenCalled();
  });

  it('pembayaran inquiry milik member lain ditolak tanpa memanggil provider', async () => {
    const { service, prisma, adapter } = buildDeps();
    prisma.transactionPascabayar.findFirst.mockResolvedValue(null);
    const res = await service.pembayaranPascabayar(999, 'PSC-1');
    expect(res.error).toBe(true);
    expect(adapter.pay).not.toHaveBeenCalled();
    expect(prisma.member.updateMany).not.toHaveBeenCalled();
  });

  it('pembayaran ganda tidak melakukan debit kedua', async () => {
    const { service, prisma } = buildDeps();
    prisma.transactionPascabayar.findFirst.mockResolvedValue({
      id: 2,
      trId: 'PSC-2',
      status: 'proses',
      memberId: 7,
      paymentAttemptedAt: new Date(),
      expiredAt: new Date(Date.now() + 100000),
      provider: 'DIGIFLAZZ',
      providerSku: 'SKU',
      nomorTujuan: '123',
      total: 12500,
      inquiryPayload: {},
    });
    const res = await service.pembayaranPascabayar(7, 'PSC-2');
    expect(res.error).toBe(false);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('pembayaran dengan saldo tidak cukup ditolak sebelum request provider', async () => {
    const { service, prisma, adapter } = buildDeps();
    prisma.transactionPascabayar.findFirst.mockResolvedValue({
      id: 3,
      trId: 'PSC-3',
      status: 'proses',
      memberId: 7,
      paymentAttemptedAt: null,
      expiredAt: new Date(Date.now() + 100000),
      provider: 'DIGIFLAZZ',
      providerSku: 'SKU',
      nomorTujuan: '123',
      total: 12500,
      inquiryPayload: {},
    });
    prisma.member.updateMany.mockResolvedValue({ count: 0 });

    const res = await service.pembayaranPascabayar(7, 'PSC-3');
    expect(res.error).toBe(true);
    expect(adapter.pay).not.toHaveBeenCalled();
  });

  it('pembayaran sukses mencatat debit dan memanggil finalizer', async () => {
    const { service, prisma, adapter, finalizer } = buildDeps();
    prisma.transactionPascabayar.findFirst.mockResolvedValue({
      id: 4,
      trId: 'PSC-4',
      status: 'proses',
      memberId: 7,
      paymentAttemptedAt: null,
      expiredAt: new Date(Date.now() + 100000),
      provider: 'DIGIFLAZZ',
      providerSku: 'SKU',
      nomorTujuan: '123',
      total: 12500,
      inquiryPayload: { providerType: null },
    });
    adapter.pay.mockResolvedValue({ status: 'sukses', sn: 'SN-4', definitiveFailure: false });

    const res = await service.pembayaranPascabayar(7, 'PSC-4');

    expect(res.error).toBe(false);
    expect(prisma.riwayatSaldo.create).toHaveBeenCalled();
    expect(prisma.riwayatTransaksi.create).toHaveBeenCalledWith({
      data: { memberId: 7, tipeTransaksi: 'beli_produk_pascabayar' },
    });
    expect(finalizer.finalizeSuccess).toHaveBeenCalledWith(expect.objectContaining({ transactionId: 4, sn: 'SN-4' }));
  });

  it('inquiry yang sudah kedaluwarsa ditolak', async () => {
    const { service, prisma } = buildDeps();
    prisma.transactionPascabayar.findFirst.mockResolvedValue({
      id: 5,
      trId: 'PSC-5',
      status: 'proses',
      memberId: 7,
      paymentAttemptedAt: null,
      expiredAt: new Date(Date.now() - 1000),
      provider: 'DIGIFLAZZ',
      providerSku: 'SKU',
      nomorTujuan: '123',
      total: 12500,
      inquiryPayload: {},
    });
    const res = await service.pembayaranPascabayar(7, 'PSC-5');
    expect(res.error).toBe(true);
    expect(prisma.transactionPascabayar.updateMany).toHaveBeenCalledWith({
      where: { id: 5, status: 'proses', paymentAttemptedAt: null },
      data: { status: 'expired', providerStatus: 'expired' },
    });
  });

  it('pembayaran yang sudah dikirim tidak diubah menjadi expired setelah pergantian hari', async () => {
    const { service, prisma, adapter } = buildDeps();
    prisma.transactionPascabayar.findFirst.mockResolvedValue({
      id: 6,
      trId: 'PSC-6',
      status: 'proses',
      memberId: 7,
      // Pembayaran sudah dikirim kemarin dan saldo sudah terpotong.
      paymentAttemptedAt: new Date(Date.now() - 24 * 3600 * 1000),
      expiredAt: new Date(Date.now() - 3600 * 1000),
      provider: 'DIGIFLAZZ',
      providerSku: 'SKU',
      nomorTujuan: '123',
      total: 12500,
      inquiryPayload: {},
    });

    const res = await service.pembayaranPascabayar(7, 'PSC-6');

    expect(res.error).toBe(false);
    expect(res.message).toBe('Pembayaran sedang diproses');
    expect(adapter.pay).not.toHaveBeenCalled();
    expect(prisma.transactionPascabayar.updateMany).not.toHaveBeenCalled();
  });

  it('pembayaran IAK meneruskan tr_id hasil inquiry ke adapter', async () => {
    const { service, prisma, adapter, finalizer } = buildDeps();
    prisma.transactionPascabayar.findFirst.mockResolvedValue({
      id: 7,
      trId: 'PSC-7',
      status: 'proses',
      memberId: 7,
      paymentAttemptedAt: null,
      expiredAt: new Date(Date.now() + 100000),
      provider: 'IAK',
      providerSku: 'PLNPOST',
      providerRefId: 'TRX-7',
      nomorTujuan: '123',
      total: 12500,
      inquiryPayload: { providerType: 'pln' },
    });
    adapter.pay.mockResolvedValue({ status: 'sukses', sn: 'SN-7', definitiveFailure: false });

    await service.pembayaranPascabayar(7, 'PSC-7');

    expect(adapter.pay).toHaveBeenCalledWith(
      expect.objectContaining({ refId: 'PSC-7', providerRefId: 'TRX-7', sku: 'PLNPOST' }),
    );
    expect(finalizer.finalizeSuccess).toHaveBeenCalled();
  });

  it('pembayaran IAK tanpa tr_id ditolak sebelum debit dan tanpa request provider', async () => {
    const { service, prisma, adapter } = buildDeps();
    prisma.transactionPascabayar.findFirst.mockResolvedValue({
      id: 9,
      trId: 'PSC-9',
      status: 'proses',
      memberId: 7,
      paymentAttemptedAt: null,
      expiredAt: new Date(Date.now() + 100000),
      provider: 'IAK',
      providerSku: 'PLNPOST',
      providerRefId: null,
      nomorTujuan: '123',
      total: 12500,
      inquiryPayload: { providerType: 'pln' },
    });

    const res = await service.pembayaranPascabayar(7, 'PSC-9');

    expect(res.error).toBe(true);
    expect(adapter.pay).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(prisma.member.updateMany).not.toHaveBeenCalled();
  });

  it('detail menyertakan tarif, daya, dan noref dari snapshot inquiry provider', async () => {
    const { service, prisma } = buildDeps();
    prisma.transactionPascabayar.findFirst.mockResolvedValue({
      id: 8,
      trId: 'PSC-8',
      status: 'sukses',
      memberId: 7,
      nomorTujuan: '530000000001',
      trName: 'BUDI',
      nominal: 8500,
      total: 11000,
      adminFee: 2500,
      tarif: null,
      daya: null,
      providerRefId: 'TRX-8',
      noref: 'BILLER-8',
      serial_number: 'SN-8',
      produkId: 1,
      createdAt: new Date('2026-09-27T03:00:00Z'),
      ket: 'Pembayaran berhasil',
      provider: 'DIGIFLAZZ',
      inquiryPayload: {
        period: '201901',
        tarif: 'R1',
        daya: 1300,
        providerAdminFee: 2500,
        detail: { tr_id: 'TRX-8', desc: { tarif: 'R1', daya: 1300 } },
      },
    });
    prisma.produkPascabayar.findUnique.mockResolvedValue({ id: 1, name: 'PLN Pascabayar' });

    const res = await service.getDetailPascabayar(7, 'PSC-8');

    expect(res.error).toBe(false);
    expect(res.data.tarif).toBe('R1');
    expect(res.data.daya).toBe(1300);
    // noref = nomor bukti biller; tr_id = ID inquiry, keduanya dipisah.
    expect(res.data.noref).toBe('BILLER-8');
    expect(res.data.tr_id).toBe('TRX-8');
    expect(res.data.periode).toBe('201901');
    expect(res.data.sn).toBe('SN-8');
  });
});

