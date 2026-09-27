import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PascabayarCatalogService } from './pascabayar-catalog.service';

function buildPrisma() {
  const prisma: any = {
    digiflazzPascabayarProduct: {
      findUnique: jest.fn(),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
    produkPascabayarProvider: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      update: jest.fn().mockResolvedValue({}),
      findMany: jest.fn().mockResolvedValue([]),
      delete: jest.fn(),
    },
    produkPascabayar: { findUnique: jest.fn(), findMany: jest.fn() },
    iakPascabayarProduct: { findUnique: jest.fn(), findFirst: jest.fn() },
    activityLog: { create: jest.fn().mockResolvedValue({}) },
  };
  prisma.$transaction = jest.fn(async (cb: any) => cb(prisma));
  return prisma;
}

describe('PascabayarCatalogService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('sinkronisasi dua kali tetap idempotent dan tidak menggandakan katalog', async () => {
    const prisma = buildPrisma();
    const digiflazz = {
      getPascabayarPricelist: jest.fn().mockResolvedValue([
        { buyer_sku_code: 'PLN-A', product_name: 'PLN A', price: 10000, admin: 2500, commission: 0, buyer_product_status: true },
        { buyer_sku_code: 'PLN-B', product_name: 'PLN B', price: 20000, admin: 2500, commission: 100 },
      ]),
    } as any;
    const service = new PascabayarCatalogService(prisma, digiflazz);

    prisma.digiflazzPascabayarProduct.findUnique.mockResolvedValue(null);
    const first = await service.syncDigiflazzPascabayar(1);
    expect(first.inserted).toBe(2);
    expect(first.updated).toBe(0);
    expect(prisma.digiflazzPascabayarProduct.create).toHaveBeenCalledTimes(2);

    prisma.digiflazzPascabayarProduct.findUnique.mockResolvedValue({ id: 10 });
    const second = await service.syncDigiflazzPascabayar(1);
    expect(second.inserted).toBe(0);
    expect(second.updated).toBe(2);
    expect(prisma.digiflazzPascabayarProduct.create).toHaveBeenCalledTimes(2);
  });

  it('tidak menyimpan nilai komisi nol sebagai null', async () => {
    const prisma = buildPrisma();
    const digiflazz = {
      getPascabayarPricelist: jest
        .fn()
        .mockResolvedValue([{ buyer_sku_code: 'X', price: 1000, admin: 0, commission: 0 }]),
    } as any;
    const service = new PascabayarCatalogService(prisma, digiflazz);
    prisma.digiflazzPascabayarProduct.findUnique.mockResolvedValue(null);

    await service.syncDigiflazzPascabayar(1);
    const payload = prisma.digiflazzPascabayarProduct.create.mock.calls[0][0].data;
    expect(payload.admin).toBe(0);
    expect(payload.commission).toBe(0);
  });

  it('katalog kosong ditolak tanpa menghapus data lama', async () => {
    const prisma = buildPrisma();
    const digiflazz = { getPascabayarPricelist: jest.fn().mockResolvedValue([]) } as any;
    const service = new PascabayarCatalogService(prisma, digiflazz);

    await expect(service.syncDigiflazzPascabayar(1)).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.digiflazzPascabayarProduct.create).not.toHaveBeenCalled();
  });

  it('memilih provider aktif menonaktifkan provider lain pada produk yang sama', async () => {
    const prisma = buildPrisma();
    const digiflazz = {} as any;
    const service = new PascabayarCatalogService(prisma, digiflazz);
    prisma.produkPascabayarProvider.findUnique.mockResolvedValue({ id: 5, providerSku: 'SKU-X' });

    await service.selectActiveProvider(11, 'DIGIFLAZZ', 1);

    expect(prisma.produkPascabayarProvider.updateMany).toHaveBeenCalledWith({
      where: { produkPascabayarId: 11, NOT: { provider: 'DIGIFLAZZ' } },
      data: { isActive: false },
    });
    expect(prisma.produkPascabayarProvider.update).toHaveBeenCalledWith({
      where: { id: 5 },
      data: { isActive: true },
    });
  });

  it('menolak memilih provider yang belum dihubungkan', async () => {
    const prisma = buildPrisma();
    const service = new PascabayarCatalogService(prisma, {} as any);
    prisma.produkPascabayarProvider.findUnique.mockResolvedValue(null);
    await expect(service.selectActiveProvider(11, 'IAK', 1)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('menolak pemetaan produk internal yang tidak ada', async () => {
    const prisma = buildPrisma();
    const service = new PascabayarCatalogService(prisma, {} as any);
    prisma.produkPascabayar.findUnique.mockResolvedValue(null);
    await expect(
      service.connectProvider({ produkPascabayarId: 99, provider: 'DIGIFLAZZ', providerSku: 'X' }, 1),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('membandingkan provider pada harga jual yang sama tanpa mengarang harga pokok', async () => {
    const prisma = buildPrisma();
    const service = new PascabayarCatalogService(prisma, {} as any);
    prisma.produkPascabayar.findUnique.mockResolvedValue({
      id: 11,
      kode: 'PLN-PASCA',
      name: 'PLN Pascabayar',
      fee: 2500,
      comission: 0,
    });
    prisma.produkPascabayarProvider.findMany.mockResolvedValue([
      {
        id: 1,
        provider: 'DIGIFLAZZ',
        providerSku: 'pln',
        isActive: true,
        digiflazzProduct: {
          admin: 2500,
          commission: 500,
          name: 'Pln Postpaid',
          category: 'Pascabayar',
          buyerProductStatus: true,
        },
        iakProduct: null,
      },
      {
        id: 2,
        provider: 'IAK',
        providerSku: 'PLNPOST',
        isActive: false,
        digiflazzProduct: null,
        iakProduct: { fee: 2000, komisi: 700, name: 'PLN', status: 'active', type: { type: 'pln' } },
      },
    ]);

    const res = await service.compareProviders(11);
    const digi = res.kandidat.find((k: any) => k.provider === 'DIGIFLAZZ');
    const iak = res.kandidat.find((k: any) => k.provider === 'IAK');

    // laba = fee aplikasi - admin provider + komisi provider, pada harga jual yang sama.
    expect(digi.labaEstimasi).toBe(2500 - 2500 + 500);
    expect(iak.labaEstimasi).toBe(2500 - 2000 + 700);
    // Harga pokok & harga jual tidak dikarang dari katalog.
    expect(digi.biayaPerolehan).toBeNull();
    expect(digi.hargaJualEstimasi).toBeNull();
    expect(digi.hargaPokokEstimasi).toBeNull();
    expect(res.asumsi.join(' ')).toContain('harga jual yang sama');
  });

  it('tidak menampilkan estimasi laba bila komponen biaya belum diketahui', async () => {
    const prisma = buildPrisma();
    const service = new PascabayarCatalogService(prisma, {} as any);
    prisma.produkPascabayar.findUnique.mockResolvedValue({ id: 12, fee: 2500 });
    prisma.produkPascabayarProvider.findMany.mockResolvedValue([
      {
        id: 3,
        provider: 'DIGIFLAZZ',
        providerSku: 'x',
        isActive: true,
        digiflazzProduct: { admin: null, commission: 500 },
        iakProduct: null,
      },
    ]);

    const res = await service.compareProviders(12);

    expect(res.kandidat[0].labaEstimasi).toBeNull();
    expect(res.kandidat[0].adminProvider).toBeNull();
  });
});

