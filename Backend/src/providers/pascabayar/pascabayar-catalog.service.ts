import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PascabayarProvider } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import { DigiflazzService } from '../digiflazz.service';
import { toIntOrNull } from './pascabayar-normalize';

type Provider = 'IAK' | 'DIGIFLAZZ';

export interface ProviderConnectorInput {
  produkPascabayarId: number;
  provider: Provider;
  providerSku: string;
  iakProductId?: number | null;
  digiflazzProductId?: number | null;
}

/**
 * Katalog & pemetaan provider pascabayar.
 *
 * Aturan penting:
 * - Sinkronisasi bersifat idempotent berdasarkan SKU unik. Kegagalan request
 *   tidak pernah menghapus katalog/pemetaan yang ada.
 * - SKU yang tidak muncul pada respons berfilter TIDAK otomatis dinonaktifkan.
 * - Perubahan provider hanya lewat aksi admin eksplisit.
 */
@Injectable()
export class PascabayarCatalogService {
  private readonly logger = new Logger(PascabayarCatalogService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly digiflazz: DigiflazzService,
  ) {}

  // ── Katalog Digiflazz pascabayar ──────────────────────────────────────────

  async syncDigiflazzPascabayar(adminId: number) {
    const items = await this.digiflazz.getPascabayarPricelist();
    if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestException('Katalog pascabayar Digiflazz kosong; katalog lama tidak diubah');
    }

    let inserted = 0;
    let updated = 0;
    const now = new Date();

    for (const item of items) {
      const sku = String(item?.buyer_sku_code ?? '').trim();
      if (!sku) continue;

      const data = {
        name: item?.product_name ?? null,
        category: item?.category ?? null,
        brand: item?.brand ?? null,
        sellerName: item?.seller_name ?? null,
        price: toIntOrNull(item?.price),
        admin: toIntOrNull(item?.admin),
        commission: toIntOrNull(item?.commission),
        buyerProductStatus: item?.buyer_product_status === undefined ? null : Boolean(item.buyer_product_status),
        sellerProductStatus: item?.seller_product_status === undefined ? null : Boolean(item.seller_product_status),
        desc: item?.desc ?? null,
        syncedAt: now,
      };

      const existing = await this.prisma.digiflazzPascabayarProduct.findUnique({ where: { buyerSkuCode: sku } });
      if (existing) {
        await this.prisma.digiflazzPascabayarProduct.update({ where: { id: existing.id }, data });
        updated += 1;
      } else {
        await this.prisma.digiflazzPascabayarProduct.create({ data: { buyerSkuCode: sku, ...data } });
        inserted += 1;
      }
    }

    await this.prisma.activityLog.create({
      data: {
        userId: adminId,
        action: 'SYNC_KATALOG_PASCABAYAR_DIGIFLAZZ',
        entity: 'DigiflazzPascabayarProduct',
        description: `Sinkronisasi katalog pascabayar Digiflazz. Baru: ${inserted}, Diperbarui: ${updated}, Total respons: ${items.length}`,
      },
    });

    return { error: false, error_msg: '', inserted, updated, total: items.length };
  }

  async listDigiflazzPascabayarProducts(query: {
    page?: string | number;
    limit?: string | number;
    search?: string;
    category?: string;
    connected?: string;
  }) {
    const page = Math.max(parseInt(String(query.page ?? '1'), 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(String(query.limit ?? '20'), 10) || 20, 1), 100);
    const where: any = {};

    if (query.search) {
      where.OR = [
        { buyerSkuCode: { contains: query.search, mode: 'insensitive' } },
        { name: { contains: query.search, mode: 'insensitive' } },
        { brand: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.category) where.category = query.category;
    if (query.connected === 'connected') where.providerSelections = { some: {} };
    else if (query.connected === 'disconnected') where.providerSelections = { none: {} };

    const [list, total] = await Promise.all([
      this.prisma.digiflazzPascabayarProduct.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { buyerSkuCode: 'asc' },
        include: { providerSelections: { include: { produkPascabayar: { select: { id: true, kode: true, name: true } } } } },
      }),
      this.prisma.digiflazzPascabayarProduct.count({ where }),
    ]);

    return { list, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getDigiflazzPascabayarCategories() {
    const rows = await this.prisma.digiflazzPascabayarProduct.findMany({
      where: { category: { not: null } },
      distinct: ['category'],
      select: { category: true },
      orderBy: { category: 'asc' },
    });
    return rows.map((r) => r.category).filter(Boolean);
  }

  // ── Pemetaan & pemilihan provider ─────────────────────────────────────────

  async getInternalProductOptions(search = '') {
    const where: any = {};
    if (search) {
      where.OR = [
        { kode: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }
    const rows = await this.prisma.produkPascabayar.findMany({
      where,
      take: 50,
      orderBy: { kode: 'asc' },
      include: { kategori: { select: { name: true } } },
    });
    return rows.map((p) => ({
      id: p.id,
      kode: p.kode,
      name: p.name,
      fee: p.fee,
      comission: p.comission,
      kategori: p.kategori?.name ?? null,
    }));
  }

  async connectProvider(input: ProviderConnectorInput, adminId: number) {
    const produk = await this.prisma.produkPascabayar.findUnique({ where: { id: input.produkPascabayarId } });
    if (!produk) throw new NotFoundException('Produk pascabayar internal tidak ditemukan');

    const sku = String(input.providerSku ?? '').trim();
    if (!sku) throw new BadRequestException('SKU provider wajib diisi');

    let digiflazzProductId: number | null = input.digiflazzProductId ?? null;
    let iakProductId: number | null = input.iakProductId ?? null;

    if (input.provider === 'DIGIFLAZZ') {
      const catalog = digiflazzProductId
        ? await this.prisma.digiflazzPascabayarProduct.findUnique({ where: { id: digiflazzProductId } })
        : await this.prisma.digiflazzPascabayarProduct.findUnique({ where: { buyerSkuCode: sku } });
      if (!catalog) throw new BadRequestException(`SKU Digiflazz pascabayar ${sku} tidak ada di katalog. Jalankan sinkronisasi katalog dulu.`);
      digiflazzProductId = catalog.id;
      iakProductId = null;
    } else {
      const iak = iakProductId
        ? await this.prisma.iakPascabayarProduct.findUnique({ where: { id: iakProductId } })
        : await this.prisma.iakPascabayarProduct.findFirst({ where: { code: sku }, orderBy: { id: 'asc' } });
      if (!iak) throw new BadRequestException(`SKU IAK pascabayar ${sku} tidak ditemukan.`);
      iakProductId = iak.id;
      digiflazzProductId = null;
    }

    const mapping = await this.prisma.produkPascabayarProvider.upsert({
      where: { produkPascabayarId_provider: { produkPascabayarId: input.produkPascabayarId, provider: input.provider as PascabayarProvider } },
      create: {
        produkPascabayarId: input.produkPascabayarId,
        provider: input.provider as PascabayarProvider,
        providerSku: sku,
        iakProductId,
        digiflazzProductId,
        isActive: false,
      },
      update: { providerSku: sku, iakProductId, digiflazzProductId },
      include: { digiflazzProduct: true, iakProduct: true },
    });

    await this.logActivity(adminId, 'CONNECT_PEMETAAN_PASCABAYAR', input.produkPascabayarId, `Hubungkan produk ${input.produkPascabayarId} ke ${input.provider}/${sku}`);
    return mapping;
  }

  async disconnectProvider(produkPascabayarId: number, provider: Provider, adminId: number) {
    const existing = await this.prisma.produkPascabayarProvider.findUnique({
      where: { produkPascabayarId_provider: { produkPascabayarId, provider: provider as PascabayarProvider } },
    });
    if (!existing) throw new NotFoundException('Pemetaan provider tidak ditemukan');
    if (existing.isActive) throw new BadRequestException('Provider aktif tidak dapat dilepas. Pilih provider pengganti terlebih dahulu.');

    await this.prisma.produkPascabayarProvider.delete({ where: { id: existing.id } });
    await this.logActivity(adminId, 'DISCONNECT_PEMETAAN_PASCABAYAR', produkPascabayarId, `Lepas pemetaan ${provider}`);
    return { error: false, error_msg: '' };
  }

  /**
   * Pilih provider aktif untuk inquiry baru.
   * Atomik: hanya satu provider yang aktif per produk. Tidak menyentuh inquiry
   * yang sudah berjalan karena inquiry menyimpan snapshot provider/SKU sendiri.
   */
  async selectActiveProvider(produkPascabayarId: number, provider: Provider, adminId: number) {
    const mapping = await this.prisma.produkPascabayarProvider.findUnique({
      where: { produkPascabayarId_provider: { produkPascabayarId, provider: provider as PascabayarProvider } },
    });
    if (!mapping) throw new BadRequestException(`Produk belum dihubungkan ke provider ${provider}`);
    if (!mapping.providerSku) throw new BadRequestException('Pemetaan provider belum memiliki SKU');

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.produkPascabayarProvider.updateMany({
        where: { produkPascabayarId, NOT: { provider: provider as PascabayarProvider } },
        data: { isActive: false },
      });
      return tx.produkPascabayarProvider.update({
        where: { id: mapping.id },
        data: { isActive: true },
      });
    });

    await this.logActivity(adminId, 'PILIH_PROVIDER_PASCABAYAR', produkPascabayarId, `Provider aktif produk ${produkPascabayarId} -> ${provider}/${mapping.providerSku}`);
    return result;
  }

  async listCandidates(produkPascabayarId: number) {
    return this.prisma.produkPascabayarProvider.findMany({
      where: { produkPascabayarId },
      orderBy: { id: 'asc' },
      include: { digiflazzProduct: true, iakProduct: { include: { type: true } } },
    });
  }

  // ── Perbandingan biaya & estimasi keuntungan ──────────────────────────────

  /**
   * Perbandingan kandidat provider pada produk internal.
   *
   * Kedua provider dibandingkan pada harga jual yang SAMA: pelanggan membayar
   * tagihan + fee aplikasi internal, sehingga yang membedakan hanya biaya admin
   * provider dan komisi yang diterima. Tagihan dan harga pokok final baru
   * diketahui dari respons inquiry, jadi tidak diestimasi dari katalog.
   * Asumsi ikut dikembalikan pada field `asumsi` supaya UI tidak menampilkan
   * keuntungan yang belum terbukti.
   */
  async compareProviders(produkPascabayarId: number) {
    const produk = await this.prisma.produkPascabayar.findUnique({ where: { id: produkPascabayarId } });
    if (!produk) throw new NotFoundException('Produk pascabayar internal tidak ditemukan');

    const candidates = await this.listCandidates(produkPascabayarId);
    const biayaAplikasi = produk.fee === null || produk.fee === undefined ? null : produk.fee;

    const rows = candidates.map((c) => {
      const digi = c.digiflazzProduct;
      const iak = c.iakProduct;

      // Digiflazz pasca: katalog hanya memuat `admin` + `commission` (tanpa `price`).
      // IAK pasca: katalog memuat `fee` (biaya admin) + `komisi`.
      const adminProvider = c.provider === 'DIGIFLAZZ' ? digi?.admin ?? null : iak?.fee ?? null;
      const komisiProvider = c.provider === 'DIGIFLAZZ' ? digi?.commission ?? null : iak?.komisi ?? null;

      // Pada harga jual yang sama: laba = feeAplikasi - adminProvider + komisiProvider.
      const labaEstimasi =
        biayaAplikasi === null || adminProvider === null
          ? null
          : biayaAplikasi - adminProvider + (komisiProvider ?? 0);

      return {
        mappingId: c.id,
        provider: c.provider,
        providerSku: c.providerSku,
        isActive: c.isActive,
        nama: c.provider === 'DIGIFLAZZ' ? digi?.name ?? null : iak?.name ?? null,
        kategori: c.provider === 'DIGIFLAZZ' ? digi?.category ?? null : iak?.type?.type ?? null,
        tersedia: c.provider === 'DIGIFLAZZ' ? digi?.buyerProductStatus ?? null : iak?.status === 'active',
        sinkronTerakhir: digi?.syncedAt ?? null,
        // Tidak diestimasi dari katalog; nilainya baru ada saat inquiry.
        biayaPerolehan: null,
        adminProvider,
        komisiProvider,
        biayaAdminAplikasi: biayaAplikasi,
        hargaPokokEstimasi: null,
        hargaJualEstimasi: null,
        labaEstimasi,
      };
    });

    return {
      produk: { id: produk.id, kode: produk.kode, name: produk.name, fee: produk.fee, comission: produk.comission },
      asumsi: [
        'Kedua provider dibandingkan pada harga jual yang sama: pelanggan membayar tagihan + fee aplikasi internal.',
        'labaEstimasi = feeAplikasi - adminProvider + komisiProvider; adminProvider Digiflazz dari katalog `admin`, IAK dari `fee`.',
        'Tagihan pelanggan dan harga pokok provider (mis. `price` Digiflazz) baru diketahui dari respons inquiry, sehingga tidak diestimasi di sini.',
        'Katalog pascabayar Digiflazz tidak memuat harga pokok; `price` hanya muncul pada respons transaksi.',
        'Nilai null berarti data belum tersedia, bukan nol.',
      ],
      kandidat: rows,
    };
  }

  private async logActivity(adminId: number, action: string, entityId: number, description: string) {
    try {
      await this.prisma.activityLog.create({
        data: { userId: adminId, action, entity: 'ProdukPascabayarProvider', entityId: String(entityId), description },
      });
    } catch (err) {
      this.logger.warn(`Gagal menulis activity log ${action}: ${(err as Error).message}`);
    }
  }
}
