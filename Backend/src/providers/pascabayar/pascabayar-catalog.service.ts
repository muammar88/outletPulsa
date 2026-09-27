import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PascabayarProvider } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import { DigiflazzService } from '../digiflazz.service';
import { toIntOrNull } from './pascabayar-normalize';

type Provider = 'IAK' | 'DIGIFLAZZ';

/** Prisma melempar error berkode P2002 saat unique constraint dilanggar. */
function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { code?: unknown }).code === 'P2002'
  );
}

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
    seller?: string;
    availability?: string;
    connected?: string;
  }) {
    const page = Math.max(parseInt(String(query.page ?? '1'), 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(String(query.limit ?? '20'), 10) || 20, 1), 100);
    const and: any[] = [];

    const search = String(query.search ?? '').trim();
    if (search) {
      and.push({
        OR: [
          { buyerSkuCode: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
          { brand: { contains: search, mode: 'insensitive' } },
          { sellerName: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    const category = String(query.category ?? '').trim();
    if (category) and.push({ category });

    const seller = String(query.seller ?? '').trim();
    if (seller) and.push({ sellerName: seller });

    // Filter koneksi hanya menghitung pemetaan provider DIGIFLAZZ.
    if (query.connected === 'connected') {
      and.push({ providerSelections: { some: { provider: 'DIGIFLAZZ' } } });
    } else if (query.connected === 'disconnected') {
      and.push({ providerSelections: { none: { provider: 'DIGIFLAZZ' } } });
    }

    // `null` berbeda makna dari `false`; jangan memakai pemeriksaan truthy/falsy.
    if (query.availability === 'available') {
      and.push({ buyerProductStatus: true, sellerProductStatus: true });
    } else if (query.availability === 'unavailable') {
      and.push({ OR: [{ buyerProductStatus: false }, { sellerProductStatus: false }] });
    } else if (query.availability === 'unknown') {
      // `not: false` tidak menyertakan NULL pada kolom nullable, jadi status
      // diuji eksplisit: tidak ada `false`, dan sedikitnya satu `null`.
      and.push({
        AND: [
          { OR: [{ buyerProductStatus: true }, { buyerProductStatus: null }] },
          { OR: [{ sellerProductStatus: true }, { sellerProductStatus: null }] },
          { OR: [{ buyerProductStatus: null }, { sellerProductStatus: null }] },
        ],
      });
    }

    const where: any = and.length ? { AND: and } : {};

    const [list, total] = await Promise.all([
      this.prisma.digiflazzPascabayarProduct.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { buyerSkuCode: 'asc' },
        include: {
          providerSelections: {
            where: { provider: 'DIGIFLAZZ' },
            include: { produkPascabayar: { select: { id: true, kode: true, name: true } } },
          },
        },
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

  /** Daftar seller pascabayar Digiflazz: unik, tanpa nilai kosong, urut alfabet. */
  async listDigiflazzPascabayarSellers() {
    const rows = await this.prisma.digiflazzPascabayarProduct.findMany({
      where: { sellerName: { not: null } },
      distinct: ['sellerName'],
      select: { sellerName: true },
    });
    // `distinct` di database bekerja pada nilai mentah, sehingga "Seller A"
    // dan " Seller A " bisa lolos sebagai dua baris lalu menghasilkan dua
    // seller yang sama. Nilai di-trim dahulu, lalu di-deduplikasi tanpa
    // memandang besar-kecil huruf.
    const unique = new Map<string, string>();
    for (const row of rows) {
      const name = String(row.sellerName ?? '').trim();
      if (!name) continue;
      const key = name.toLowerCase();
      if (!unique.has(key)) unique.set(key, name);
    }
    return [...unique.values()].sort((a, b) => {
      const left = a.toLowerCase();
      const right = b.toLowerCase();
      if (left < right) return -1;
      if (left > right) return 1;
      return 0;
    });
  }

  // ── Pemetaan & pemilihan provider ─────────────────────────────────────────

  async getInternalProductOptions(
    search = '',
    options: { provider?: string; connection?: string; catalogId?: number | null } = {},
  ) {
    const and: any[] = [];
    const keyword = String(search ?? '').trim();
    if (keyword) {
      and.push({
        OR: [
          { kode: { contains: keyword, mode: 'insensitive' } },
          { name: { contains: keyword, mode: 'insensitive' } },
        ],
      });
    }

    // Produk yang sudah dipetakan ke provider ini tidak boleh ditawarkan lagi,
    // kecuali pemetaan itu menunjuk katalog yang sedang diedit (idempoten).
    if (options.provider === 'DIGIFLAZZ' && options.connection === 'available') {
      const alternatives: any[] = [{ providerSelections: { none: { provider: 'DIGIFLAZZ' } } }];
      if (options.catalogId) {
        alternatives.push({
          providerSelections: { some: { provider: 'DIGIFLAZZ', digiflazzProductId: options.catalogId } },
        });
      }
      and.push({ OR: alternatives });
    }

    const where: any = and.length ? { AND: and } : {};
    const rows = await this.prisma.produkPascabayar.findMany({
      where,
      take: 50,
      orderBy: { kode: 'asc' },
      include: {
        kategori: { select: { name: true } },
        providerSelections: {
          where: { provider: 'DIGIFLAZZ' },
          select: { id: true, providerSku: true, digiflazzProductId: true, isActive: true },
        },
      },
    });
    return rows.map((p) => ({
      id: p.id,
      kode: p.kode,
      name: p.name,
      fee: p.fee,
      comission: p.comission,
      kategori: p.kategori?.name ?? null,
      digiflazzMappings: (p.providerSelections ?? []).map((m) => ({
        id: m.id,
        providerSku: m.providerSku,
        digiflazzProductId: m.digiflazzProductId,
        isActive: m.isActive,
      })),
    }));
  }

  async connectProvider(input: ProviderConnectorInput, adminId: number) {
    const produk = await this.prisma.produkPascabayar.findUnique({ where: { id: input.produkPascabayarId } });
    if (!produk) throw new NotFoundException('Produk pascabayar internal tidak ditemukan');

    const sku = String(input.providerSku ?? '').trim();
    if (!sku) throw new BadRequestException('SKU provider wajib diisi');

    const provider = this.parseProvider(input.provider);

    if (provider === 'DIGIFLAZZ') {
      return this.connectDigiflazzProvider(
        input.produkPascabayarId,
        sku,
        input.digiflazzProductId ?? null,
        adminId,
      );
    }

    const iak = input.iakProductId
      ? await this.prisma.iakPascabayarProduct.findUnique({ where: { id: input.iakProductId } })
      : await this.prisma.iakPascabayarProduct.findFirst({ where: { code: sku }, orderBy: { id: 'asc' } });
    if (!iak) throw new BadRequestException(`SKU IAK pascabayar ${sku} tidak ditemukan.`);

    const mapping = await this.prisma.$transaction(async (tx) =>
      tx.produkPascabayarProvider.upsert({
        where: {
          produkPascabayarId_provider: {
            produkPascabayarId: input.produkPascabayarId,
            provider: 'IAK',
          },
        },
        create: {
          produkPascabayarId: input.produkPascabayarId,
          provider: 'IAK',
          providerSku: sku,
          iakProductId: iak.id,
          digiflazzProductId: null,
          isActive: false,
        },
        update: { providerSku: sku, iakProductId: iak.id, digiflazzProductId: null },
        include: { digiflazzProduct: true, iakProduct: true },
      }),
    );

    await this.logActivity(
      adminId,
      'CONNECT_PEMETAAN_PASCABAYAR',
      input.produkPascabayarId,
      `Hubungkan produk ${input.produkPascabayarId} ke IAK/${sku}`,
    );
    return mapping;
  }

  /**
   * Validasi dan simpan koneksi katalog Digiflazz pascabayar.
   *
   * - `digiflazzProductId` wajib ada dan menunjuk katalog nyata.
   * - `providerSku` wajib sama persis dengan `buyerSkuCode` katalog.
   * - Katalog berstatus buyer/seller `false` ditolak; status `null` masih boleh.
   * - Produk internal yang sudah terhubung ke SKU Digiflazz lain harus dilepas
   *   dulu supaya koneksi lama tidak tertimpa diam-diam.
   * - Pemetaan ulang ke katalog yang sama bersifat idempoten dan tidak mengubah
   *   `isActive`.
   *
   * Penulisan memakai klaim atomik pada unique `(produkPascabayarId, provider)`:
   * hanya pemetaan yang sudah menunjuk katalog yang sama yang boleh ditimpa.
   * Dua request bersamaan dengan SKU berbeda tidak dapat saling menimpa karena
   * request yang kalah ditolak unique constraint (P2002) dan diverifikasi ulang.
   */
  private async connectDigiflazzProvider(
    produkPascabayarId: number,
    sku: string,
    digiflazzProductIdInput: number | null,
    adminId: number,
  ) {
    if (!digiflazzProductIdInput) {
      throw new BadRequestException('ID katalog Digiflazz pascabayar wajib diisi');
    }

    const catalog = await this.prisma.digiflazzPascabayarProduct.findUnique({
      where: { id: digiflazzProductIdInput },
    });
    if (!catalog) {
      throw new BadRequestException('Katalog Digiflazz pascabayar tidak ditemukan. Jalankan sinkronisasi katalog dulu.');
    }
    if (catalog.buyerSkuCode !== sku) {
      throw new BadRequestException(
        `SKU ${sku} tidak sesuai dengan katalog Digiflazz ${catalog.buyerSkuCode}. Pilih katalog dari daftar.`,
      );
    }
    if (catalog.buyerProductStatus === false || catalog.sellerProductStatus === false) {
      throw new BadRequestException('Produk sedang tidak tersedia di Digiflazz sehingga tidak dapat dihubungkan.');
    }

    const where = {
      produkPascabayarId_provider: { produkPascabayarId, provider: 'DIGIFLAZZ' as const },
    };
    const data = { providerSku: sku, iakProductId: null, digiflazzProductId: catalog.id };
    const include = { digiflazzProduct: true, iakProduct: true };

    let mapping: any;
    try {
      const claimed = await this.prisma.produkPascabayarProvider.updateMany({
        where: { produkPascabayarId, provider: 'DIGIFLAZZ', digiflazzProductId: catalog.id },
        data,
      });

      if (claimed.count > 0) {
        mapping = await this.prisma.produkPascabayarProvider.findUnique({ where, include });
      } else {
        mapping = await this.prisma.produkPascabayarProvider.create({
          data: {
            produkPascabayarId,
            provider: 'DIGIFLAZZ',
            providerSku: sku,
            iakProductId: null,
            digiflazzProductId: catalog.id,
            isActive: false,
          },
          include,
        });
      }
    } catch (error) {
      if (!isUniqueConstraintError(error)) throw error;

      const existing = await this.prisma.produkPascabayarProvider.findUnique({ where });
      if (!existing || existing.digiflazzProductId !== catalog.id) {
        throw new BadRequestException(
          `Produk sudah terhubung ke SKU Digiflazz ${existing?.providerSku ?? 'lain'}. Lepas koneksi lama sebelum menghubungkan SKU baru.`,
        );
      }
      mapping = await this.prisma.produkPascabayarProvider.update({ where, data, include });
    }

    await this.logActivity(
      adminId,
      'CONNECT_PEMETAAN_PASCABAYAR',
      produkPascabayarId,
      `Hubungkan produk ${produkPascabayarId} ke DIGIFLAZZ/${sku}`,
    );
    return mapping;
  }

  /**
   * Validasi nilai provider dari request. Semua nilai selain IAK/DIGIFLAZZ
   * ditolak agar tidak pernah diperlakukan sebagai IAK.
   */
  private parseProvider(provider: unknown): Provider {
    if (provider === 'IAK' || provider === 'DIGIFLAZZ') return provider;
    throw new BadRequestException(`Provider ${String(provider)} tidak dikenal. Gunakan IAK atau DIGIFLAZZ.`);
  }

  async disconnectProvider(produkPascabayarId: number, provider: Provider, adminId: number) {
    const safeProvider = this.parseProvider(provider);
    const existing = await this.prisma.produkPascabayarProvider.findUnique({
      where: { produkPascabayarId_provider: { produkPascabayarId, provider: safeProvider as PascabayarProvider } },
    });
    if (!existing) throw new NotFoundException('Pemetaan provider tidak ditemukan');
    if (existing.isActive) throw new BadRequestException('Provider aktif tidak dapat dilepas. Pilih provider pengganti terlebih dahulu.');

    await this.prisma.produkPascabayarProvider.delete({ where: { id: existing.id } });
    await this.logActivity(adminId, 'DISCONNECT_PEMETAAN_PASCABAYAR', produkPascabayarId, `Lepas pemetaan ${safeProvider}`);
    return { error: false, error_msg: '' };
  }

  /**
   * Pilih provider aktif untuk inquiry baru.
   * Atomik: hanya satu provider yang aktif per produk. Tidak menyentuh inquiry
   * yang sudah berjalan karena inquiry menyimpan snapshot provider/SKU sendiri.
   */
  async selectActiveProvider(produkPascabayarId: number, provider: Provider, adminId: number) {
    const safeProvider = this.parseProvider(provider);
    const mapping = await this.prisma.produkPascabayarProvider.findUnique({
      where: { produkPascabayarId_provider: { produkPascabayarId, provider: safeProvider as PascabayarProvider } },
    });
    if (!mapping) throw new BadRequestException(`Produk belum dihubungkan ke provider ${safeProvider}`);
    if (!mapping.providerSku) throw new BadRequestException('Pemetaan provider belum memiliki SKU');

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.produkPascabayarProvider.updateMany({
        where: { produkPascabayarId, NOT: { provider: safeProvider as PascabayarProvider } },
        data: { isActive: false },
      });
      return tx.produkPascabayarProvider.update({
        where: { id: mapping.id },
        data: { isActive: true },
      });
    });

    await this.logActivity(adminId, 'PILIH_PROVIDER_PASCABAYAR', produkPascabayarId, `Provider aktif produk ${produkPascabayarId} -> ${safeProvider}/${mapping.providerSku}`);
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
