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
      deleteMany: jest.fn(),
    },
    produkPascabayarProvider: {
      upsert: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      update: jest.fn().mockResolvedValue({}),
      findMany: jest.fn().mockResolvedValue([]),
      delete: jest.fn(),
      deleteMany: jest.fn(),
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

  it('daftar katalog mengembalikan pagination dan providerSelections', async () => {
    const prisma = buildPrisma();
    const service = new PascabayarCatalogService(prisma, {} as any);
    prisma.digiflazzPascabayarProduct.findMany.mockResolvedValue([
      {
        id: 1,
        buyerSkuCode: 'PLN-A',
        providerSelections: [
          {
            id: 5,
            produkPascabayarId: 10,
            provider: 'DIGIFLAZZ',
            providerSku: 'PLN-A',
            isActive: false,
            produkPascabayar: { id: 10, kode: 'PLN-PASCA', name: 'PLN Pascabayar' },
          },
        ],
      },
    ]);
    prisma.digiflazzPascabayarProduct.count.mockResolvedValue(1);

    const res = await service.listDigiflazzPascabayarProducts({ page: 1, limit: 20 });

    expect(res).toMatchObject({ total: 1, page: 1, limit: 20, totalPages: 1 });
    expect(res.list[0].providerSelections[0].produkPascabayar.kode).toBe('PLN-PASCA');
    const args = prisma.digiflazzPascabayarProduct.findMany.mock.calls[0][0];
    expect(args.where).toEqual({});
    expect(args.include.providerSelections.where).toEqual({ provider: 'DIGIFLAZZ' });
  });

  it('pencarian memakai kondisi SKU, nama, brand, dan seller', async () => {
    const prisma = buildPrisma();
    const service = new PascabayarCatalogService(prisma, {} as any);

    await service.listDigiflazzPascabayarProducts({ search: 'pln' });

    const where = prisma.digiflazzPascabayarProduct.findMany.mock.calls[0][0].where;
    expect(where.AND[0].OR).toEqual(
      expect.arrayContaining([
        { buyerSkuCode: { contains: 'pln', mode: 'insensitive' } },
        { name: { contains: 'pln', mode: 'insensitive' } },
        { brand: { contains: 'pln', mode: 'insensitive' } },
        { sellerName: { contains: 'pln', mode: 'insensitive' } },
      ]),
    );
  });

  it('filter seller dan kategori memakai nilai exact yang dipilih', async () => {
    const prisma = buildPrisma();
    const service = new PascabayarCatalogService(prisma, {} as any);

    await service.listDigiflazzPascabayarProducts({ seller: 'SELLER A', category: 'Pascabayar' });

    const where = prisma.digiflazzPascabayarProduct.findMany.mock.calls[0][0].where;
    expect(where.AND).toEqual(
      expect.arrayContaining([{ sellerName: 'SELLER A' }, { category: 'Pascabayar' }]),
    );
  });

  it('filter ketersediaan membedakan true, false, dan null', async () => {
    const prisma = buildPrisma();
    const service = new PascabayarCatalogService(prisma, {} as any);

    await service.listDigiflazzPascabayarProducts({ availability: 'available' });
    expect(prisma.digiflazzPascabayarProduct.findMany.mock.calls[0][0].where.AND).toContainEqual({
      buyerProductStatus: true,
      sellerProductStatus: true,
    });

    prisma.digiflazzPascabayarProduct.findMany.mockClear();
    await service.listDigiflazzPascabayarProducts({ availability: 'unavailable' });
    expect(prisma.digiflazzPascabayarProduct.findMany.mock.calls[0][0].where.AND).toContainEqual({
      OR: [{ buyerProductStatus: false }, { sellerProductStatus: false }],
    });

    prisma.digiflazzPascabayarProduct.findMany.mockClear();
    await service.listDigiflazzPascabayarProducts({ availability: 'unknown' });
    // `not: false` tidak menyertakan NULL pada kolom nullable, jadi struktur
    // di bawah ini meminta "true atau null" secara eksplisit pada kedua status.
    expect(prisma.digiflazzPascabayarProduct.findMany.mock.calls[0][0].where.AND).toContainEqual({
      AND: [
        { OR: [{ buyerProductStatus: true }, { buyerProductStatus: null }] },
        { OR: [{ sellerProductStatus: true }, { sellerProductStatus: null }] },
        { OR: [{ buyerProductStatus: null }, { sellerProductStatus: null }] },
      ],
    });
    expect(JSON.stringify(prisma.digiflazzPascabayarProduct.findMany.mock.calls[0][0].where)).not.toContain(
      '"not":false',
    );
  });

  it('filter koneksi hanya menghitung provider DIGIFLAZZ', async () => {
    const prisma = buildPrisma();
    const service = new PascabayarCatalogService(prisma, {} as any);

    await service.listDigiflazzPascabayarProducts({ connected: 'connected' });
    expect(prisma.digiflazzPascabayarProduct.findMany.mock.calls[0][0].where.AND).toContainEqual({
      providerSelections: { some: { provider: 'DIGIFLAZZ' } },
    });

    prisma.digiflazzPascabayarProduct.findMany.mockClear();
    await service.listDigiflazzPascabayarProducts({ connected: 'disconnected' });
    expect(prisma.digiflazzPascabayarProduct.findMany.mock.calls[0][0].where.AND).toContainEqual({
      providerSelections: { none: { provider: 'DIGIFLAZZ' } },
    });
  });

  it('daftar seller unik, tanpa kosong, dan urut alfabet', async () => {
    const prisma = buildPrisma();
    const service = new PascabayarCatalogService(prisma, {} as any);
    prisma.digiflazzPascabayarProduct.findMany.mockResolvedValue([
      { sellerName: 'Seller B' },
      { sellerName: 'SELLER A' },
      { sellerName: '   ' },
      { sellerName: null },
      { sellerName: 'seller c' },
    ]);

    await expect(service.listDigiflazzPascabayarSellers()).resolves.toEqual([
      'SELLER A',
      'Seller B',
      'seller c',
    ]);
    expect(prisma.digiflazzPascabayarProduct.findMany).toHaveBeenCalledWith({
      where: { sellerName: { not: null } },
      distinct: ['sellerName'],
      select: { sellerName: true },
    });
  });

  it('daftar seller menggabungkan nilai duplikat setelah trim tanpa memandang huruf besar-kecil', async () => {
    const prisma = buildPrisma();
    const service = new PascabayarCatalogService(prisma, {} as any);
    // `distinct` di database bekerja pada nilai mentah, sehingga
    // "Seller A", " Seller A ", dan "SELLER A" bisa lolos sebagai tiga baris.
    prisma.digiflazzPascabayarProduct.findMany.mockResolvedValue([
      { sellerName: 'Seller A' },
      { sellerName: ' Seller A ' },
      { sellerName: 'SELLER A' },
      { sellerName: 'seller b' },
      { sellerName: 'Seller B ' },
      { sellerName: '   ' },
    ]);

    await expect(service.listDigiflazzPascabayarSellers()).resolves.toEqual([
      'Seller A',
      'seller b',
    ]);
  });

  it('pilihan produk internal memakai filter koneksi DIGIFLAZZ bila diminta', async () => {
    const prisma = buildPrisma();
    const service = new PascabayarCatalogService(prisma, {} as any);
    prisma.produkPascabayar.findMany.mockResolvedValue([
      { id: 3, kode: 'PLN', name: 'PLN', fee: 2500, comission: 0, kategori: { name: 'Pascabayar' }, providerSelections: [] },
    ]);

    const res = await service.getInternalProductOptions('', {
      provider: 'DIGIFLAZZ',
      connection: 'available',
      catalogId: 77,
    });

    expect(res[0]).toMatchObject({ id: 3, kode: 'PLN', kategori: 'Pascabayar', digiflazzMappings: [] });
    const where = prisma.produkPascabayar.findMany.mock.calls[0][0].where;
    expect(where.AND[0].OR).toEqual(
      expect.arrayContaining([
        { providerSelections: { none: { provider: 'DIGIFLAZZ' } } },
        { providerSelections: { some: { provider: 'DIGIFLAZZ', digiflazzProductId: 77 } } },
      ]),
    );
  });

  it('koneksi valid menyimpan SKU, ID katalog, IAK null, dan tidak aktif', async () => {
    const prisma = buildPrisma();
    const service = new PascabayarCatalogService(prisma, {} as any);
    prisma.produkPascabayar.findUnique.mockResolvedValue({ id: 10 });
    prisma.digiflazzPascabayarProduct.findUnique.mockResolvedValue({
      id: 77,
      buyerSkuCode: 'PLNPOSTPAID',
      buyerProductStatus: true,
      sellerProductStatus: true,
    });
    prisma.produkPascabayarProvider.updateMany.mockResolvedValue({ count: 0 });
    prisma.produkPascabayarProvider.create.mockResolvedValue({ id: 1 });

    await service.connectProvider(
      { produkPascabayarId: 10, provider: 'DIGIFLAZZ', providerSku: 'PLNPOSTPAID', digiflazzProductId: 77 },
      1,
    );

    expect(prisma.produkPascabayarProvider.updateMany).toHaveBeenCalledWith({
      where: { produkPascabayarId: 10, provider: 'DIGIFLAZZ', digiflazzProductId: 77 },
      data: { providerSku: 'PLNPOSTPAID', iakProductId: null, digiflazzProductId: 77 },
    });
    const created = prisma.produkPascabayarProvider.create.mock.calls[0][0].data;
    expect(created).toMatchObject({
      produkPascabayarId: 10,
      provider: 'DIGIFLAZZ',
      providerSku: 'PLNPOSTPAID',
      iakProductId: null,
      digiflazzProductId: 77,
      isActive: false,
    });
  });

  it('menolak koneksi tanpa ID katalog Digiflazz', async () => {
    const prisma = buildPrisma();
    const service = new PascabayarCatalogService(prisma, {} as any);
    prisma.produkPascabayar.findUnique.mockResolvedValue({ id: 10 });

    await expect(
      service.connectProvider({ produkPascabayarId: 10, provider: 'DIGIFLAZZ', providerSku: 'X' }, 1),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.produkPascabayarProvider.create).not.toHaveBeenCalled();
  });

  it('menolak koneksi bila SKU tidak sama persis dengan katalog', async () => {
    const prisma = buildPrisma();
    const service = new PascabayarCatalogService(prisma, {} as any);
    prisma.produkPascabayar.findUnique.mockResolvedValue({ id: 10 });
    prisma.digiflazzPascabayarProduct.findUnique.mockResolvedValue({
      id: 77,
      buyerSkuCode: 'PLN-A',
      buyerProductStatus: true,
      sellerProductStatus: true,
    });

    await expect(
      service.connectProvider(
        { produkPascabayarId: 10, provider: 'DIGIFLAZZ', providerSku: 'SKU-LAIN', digiflazzProductId: 77 },
        1,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.produkPascabayarProvider.create).not.toHaveBeenCalled();
  });

  it('menolak koneksi bila produk internal sudah terhubung ke SKU Digiflazz lain', async () => {
    const prisma = buildPrisma();
    const service = new PascabayarCatalogService(prisma, {} as any);
    prisma.produkPascabayar.findUnique.mockResolvedValue({ id: 10 });
    prisma.digiflazzPascabayarProduct.findUnique.mockResolvedValue({
      id: 77,
      buyerSkuCode: 'PLN-A',
      buyerProductStatus: true,
      sellerProductStatus: true,
    });
    // Klaim tidak menemukan baris yang cocok, lalu create ditolak unique constraint
    // karena produk sudah punya pemetaan DIGIFLAZZ ke SKU lain.
    prisma.produkPascabayarProvider.updateMany.mockResolvedValue({ count: 0 });
    prisma.produkPascabayarProvider.create.mockRejectedValue({ code: 'P2002' });
    prisma.produkPascabayarProvider.findUnique.mockResolvedValue({
      id: 1,
      providerSku: 'PLN-B',
      digiflazzProductId: 88,
      isActive: false,
    });

    await expect(
      service.connectProvider(
        { produkPascabayarId: 10, provider: 'DIGIFLAZZ', providerSku: 'PLN-A', digiflazzProductId: 77 },
        1,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.produkPascabayarProvider.update).not.toHaveBeenCalled();
  });

  it('request identik yang bersamaan tetap idempoten lewat unique constraint (P2002)', async () => {
    const prisma = buildPrisma();
    const service = new PascabayarCatalogService(prisma, {} as any);
    prisma.produkPascabayar.findUnique.mockResolvedValue({ id: 10 });
    prisma.digiflazzPascabayarProduct.findUnique.mockResolvedValue({
      id: 77,
      buyerSkuCode: 'PLN-A',
      buyerProductStatus: true,
      sellerProductStatus: true,
    });
    prisma.produkPascabayarProvider.updateMany.mockResolvedValue({ count: 0 });
    prisma.produkPascabayarProvider.create.mockRejectedValue({ code: 'P2002' });
    prisma.produkPascabayarProvider.findUnique.mockResolvedValue({
      id: 1,
      providerSku: 'PLN-A',
      digiflazzProductId: 77,
      isActive: false,
    });
    prisma.produkPascabayarProvider.update.mockResolvedValue({ id: 1 });

    await expect(
      service.connectProvider(
        { produkPascabayarId: 10, provider: 'DIGIFLAZZ', providerSku: 'PLN-A', digiflazzProductId: 77 },
        1,
      ),
    ).resolves.toEqual({ id: 1 });

    const call = prisma.produkPascabayarProvider.update.mock.calls[0][0];
    expect(call.where).toEqual({
      produkPascabayarId_provider: { produkPascabayarId: 10, provider: 'DIGIFLAZZ' },
    });
    expect(call.data).not.toHaveProperty('isActive');
  });

  it('koneksi identik dua kali bersifat idempoten dan tidak mengaktifkan provider', async () => {
    const prisma = buildPrisma();
    const service = new PascabayarCatalogService(prisma, {} as any);
    prisma.produkPascabayar.findUnique.mockResolvedValue({ id: 10 });
    prisma.digiflazzPascabayarProduct.findUnique.mockResolvedValue({
      id: 77,
      buyerSkuCode: 'PLN-A',
      buyerProductStatus: true,
      sellerProductStatus: true,
    });
    // Pemetaan sudah menunjuk katalog yang sama -> klaim berhasil tanpa create.
    prisma.produkPascabayarProvider.updateMany.mockResolvedValue({ count: 1 });
    prisma.produkPascabayarProvider.findUnique.mockResolvedValue({ id: 1, isActive: true });

    await service.connectProvider(
      { produkPascabayarId: 10, provider: 'DIGIFLAZZ', providerSku: 'PLN-A', digiflazzProductId: 77 },
      1,
    );

    expect(prisma.produkPascabayarProvider.updateMany).toHaveBeenCalledWith({
      where: { produkPascabayarId: 10, provider: 'DIGIFLAZZ', digiflazzProductId: 77 },
      data: { providerSku: 'PLN-A', iakProductId: null, digiflazzProductId: 77 },
    });
    expect(prisma.produkPascabayarProvider.create).not.toHaveBeenCalled();
    expect(prisma.produkPascabayarProvider.update).not.toHaveBeenCalled();
  });

  it('menolak koneksi ke katalog yang berstatus tidak tersedia', async () => {
    const prisma = buildPrisma();
    const service = new PascabayarCatalogService(prisma, {} as any);
    prisma.produkPascabayar.findUnique.mockResolvedValue({ id: 10 });
    prisma.digiflazzPascabayarProduct.findUnique.mockResolvedValue({
      id: 77,
      buyerSkuCode: 'PLN-A',
      buyerProductStatus: true,
      sellerProductStatus: false,
    });

    await expect(
      service.connectProvider(
        { produkPascabayarId: 10, provider: 'DIGIFLAZZ', providerSku: 'PLN-A', digiflazzProductId: 77 },
        1,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.produkPascabayarProvider.create).not.toHaveBeenCalled();
  });

  it('melepas pemetaan tidak aktif tanpa menghapus katalog', async () => {
    const prisma = buildPrisma();
    const service = new PascabayarCatalogService(prisma, {} as any);
    prisma.produkPascabayarProvider.findUnique.mockResolvedValue({ id: 1, isActive: false });
    prisma.produkPascabayarProvider.delete.mockResolvedValue({});

    await service.disconnectProvider(10, 'DIGIFLAZZ', 1);

    expect(prisma.produkPascabayarProvider.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(prisma.digiflazzPascabayarProduct.deleteMany).not.toHaveBeenCalled();
  });

  it('menolak melepas pemetaan yang masih aktif', async () => {
    const prisma = buildPrisma();
    const service = new PascabayarCatalogService(prisma, {} as any);
    prisma.produkPascabayarProvider.findUnique.mockResolvedValue({ id: 1, isActive: true });

    await expect(service.disconnectProvider(10, 'DIGIFLAZZ', 1)).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.produkPascabayarProvider.delete).not.toHaveBeenCalled();
  });

  it('sinkronisasi gagal atau kosong tidak menghapus katalog dan pemetaan lama', async () => {
    const prisma = buildPrisma();
    const digiflazz = { getPascabayarPricelist: jest.fn().mockRejectedValue(new Error('network')) } as any;
    const service = new PascabayarCatalogService(prisma, digiflazz);

    await expect(service.syncDigiflazzPascabayar(1)).rejects.toBeInstanceOf(Error);
    expect(prisma.digiflazzPascabayarProduct.deleteMany).not.toHaveBeenCalled();
    expect(prisma.produkPascabayarProvider.deleteMany).not.toHaveBeenCalled();
  });

  it('menolak provider yang tidak dikenal pada connect, select, dan disconnect', async () => {
    const prisma = buildPrisma();
    const service = new PascabayarCatalogService(prisma, {} as any);
    prisma.produkPascabayar.findUnique.mockResolvedValue({ id: 10 });

    await expect(
      service.connectProvider({ produkPascabayarId: 10, provider: 'SALAH' as any, providerSku: 'X' }, 1),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.selectActiveProvider(10, 'SALAH' as any, 1)).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.disconnectProvider(10, 'SALAH' as any, 1)).rejects.toBeInstanceOf(BadRequestException);

    // Provider tak dikenal tidak boleh menyentuh pemetaan maupun katalog IAK.
    expect(prisma.produkPascabayarProvider.findUnique).not.toHaveBeenCalled();
    expect(prisma.produkPascabayarProvider.upsert).not.toHaveBeenCalled();
    expect(prisma.produkPascabayarProvider.create).not.toHaveBeenCalled();
    expect(prisma.iakPascabayarProduct.findFirst).not.toHaveBeenCalled();
  });
});

