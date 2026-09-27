import { PascabayarSelectionService } from './pascabayar-selection.service';

function buildPrisma(row: any) {
  const prisma: any = {
    produkPascabayarProvider: { findFirst: jest.fn().mockResolvedValue(row) },
    iakPascabayarProduct: { findFirst: jest.fn().mockResolvedValue(null) },
  };
  return prisma;
}

const baseRow = {
  id: 5,
  produkPascabayarId: 11,
  provider: 'DIGIFLAZZ',
  providerSku: 'pln',
  digiflazzProductId: 3,
  iakProductId: null,
  isActive: true,
  digiflazzProduct: { buyerProductStatus: true, sellerProductStatus: true },
  iakProduct: null,
};

describe('PascabayarSelectionService', () => {
  it('memilih provider aktif eksplisit beserta SKU pemetaan', async () => {
    const prisma = buildPrisma(baseRow);
    const service = new PascabayarSelectionService(prisma);

    const result = await service.resolveActive(11);

    expect(prisma.produkPascabayarProvider.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { produkPascabayarId: 11, isActive: true } }),
    );
    expect(result).toEqual(
      expect.objectContaining({ provider: 'DIGIFLAZZ', providerSku: 'pln', explicit: true }),
    );
  });

  it('menolak bila admin belum memilih provider aktif (tanpa fallback kandidat)', async () => {
    const prisma = buildPrisma(null);
    const service = new PascabayarSelectionService(prisma);

    const result = await service.resolveActive(11);

    expect(result).toBeNull();
    expect(prisma.iakPascabayarProduct.findFirst).not.toHaveBeenCalled();
    expect(prisma.produkPascabayarProvider.findFirst).toHaveBeenCalledTimes(1);
  });

  it('menolak provider aktif tanpa SKU', async () => {
    const prisma = buildPrisma({ ...baseRow, providerSku: '  ' });
    const service = new PascabayarSelectionService(prisma);
    expect(await service.resolveActive(11)).toBeNull();
  });

  it('menolak provider aktif bila baris katalognya hilang', async () => {
    const prisma = buildPrisma({ ...baseRow, digiflazzProduct: null });
    const service = new PascabayarSelectionService(prisma);
    expect(await service.resolveActive(11)).toBeNull();
  });

  it('menolak provider aktif bila status produk katalog nonaktif', async () => {
    const prisma = buildPrisma({
      ...baseRow,
      digiflazzProduct: { buyerProductStatus: true, sellerProductStatus: false },
    });
    const service = new PascabayarSelectionService(prisma);
    expect(await service.resolveActive(11)).toBeNull();
  });

  it('menolak provider IAK aktif yang produknya nonaktif', async () => {
    const prisma = buildPrisma({
      ...baseRow,
      provider: 'IAK',
      providerSku: 'PLNPOST',
      digiflazzProduct: null,
      iakProduct: { status: 'inactive' },
    });
    const service = new PascabayarSelectionService(prisma);
    expect(await service.resolveActive(11)).toBeNull();
  });

  it('mengizinkan status katalog null (belum diketahui) selama tidak nonaktif', async () => {
    const prisma = buildPrisma({
      ...baseRow,
      digiflazzProduct: { buyerProductStatus: null, sellerProductStatus: null },
    });
    const service = new PascabayarSelectionService(prisma);
    const result = await service.resolveActive(11);
    expect(result).not.toBeNull();
    expect(result?.providerSku).toBe('pln');
  });
});
