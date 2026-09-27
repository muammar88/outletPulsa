import { Injectable, Logger } from '@nestjs/common';
import { PascabayarProvider } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import { PascabayarProviderCode } from './pascabayar.types';

export interface PascabayarSelection {
  produkPascabayarId: number;
  provider: PascabayarProviderCode;
  providerSku: string;
  selectionId: number | null;
  digiflazzProductId: number | null;
  iakProductId: number | null;
  /** Tipe IAK (mis. `pln`) untuk membentuk URL bill/check. */
  providerType: string | null;
  /** true bila diambil dari pemilihan eksplisit admin, false bila fallback legacy. */
  explicit: boolean;
}

const WITH_PROVIDER_DETAIL = {
  iakProduct: { include: { type: true } },
  digiflazzProduct: true,
} as const;

/** Alasan produk tidak dapat dipakai untuk inquiry baru. */
export type PascabayarSelectionRejection =
  | 'belum_dihubungkan'
  | 'sku_kosong'
  | 'katalog_tidak_ada'
  | 'katalog_tidak_aktif';

/**
 * Resolusi provider/SKU aktif untuk sebuah produk pascabayar.
 *
 * Hanya pemilihan eksplisit admin (`isActive = true`) yang dipakai. Tidak ada
 * fallback otomatis ke kandidat termurah atau pemetaan lama: menghubungkan SKU
 * belum berarti admin memilihnya, jadi SKU yang belum dipilih tidak boleh
 * terpakai. Ketersediaan katalog juga diperiksa (produk buyer/seller nonaktif
 * atau baris katalog hilang akan ditolak).
 */
@Injectable()
export class PascabayarSelectionService {
  private readonly logger = new Logger(PascabayarSelectionService.name);

  constructor(private readonly prisma: PrismaService) {}

  async resolveActive(produkPascabayarId: number): Promise<PascabayarSelection | null> {
    const active = await this.prisma.produkPascabayarProvider.findFirst({
      where: { produkPascabayarId, isActive: true },
      orderBy: { updatedAt: 'desc' },
      include: WITH_PROVIDER_DETAIL,
    });
    if (!active) {
      this.logger.warn(`[PASCA] Produk ${produkPascabayarId} belum punya provider aktif pilihan admin`);
      return null;
    }
    if (!active.providerSku || !String(active.providerSku).trim()) {
      this.logger.warn(`[PASCA] Provider aktif produk ${produkPascabayarId} belum punya SKU`);
      return null;
    }

    const rejection = this.cekKetersediaanKatalog(active);
    if (rejection) {
      this.logger.warn(`[PASCA] Provider aktif produk ${produkPascabayarId} ditolak: ${rejection}`);
      return null;
    }

    return this.toSelection(active, true);
  }

  /**
   * Katalog yang tidak tersedia tidak boleh dipakai walau admin pernah memilihnya.
   * `null` pada status katalog berarti belum diketahui (bukan nonaktif).
   */
  private cekKetersediaanKatalog(row: {
    provider: PascabayarProvider;
    digiflazzProduct?: {
      buyerProductStatus: boolean | null;
      sellerProductStatus: boolean | null;
    } | null;
    iakProduct?: { status?: string | null } | null;
  }): 'katalog_tidak_ada' | 'katalog_tidak_aktif' | null {
    if (row.provider === 'DIGIFLAZZ') {
      if (!row.digiflazzProduct) return 'katalog_tidak_ada';
      if (row.digiflazzProduct.buyerProductStatus === false) return 'katalog_tidak_aktif';
      if (row.digiflazzProduct.sellerProductStatus === false) return 'katalog_tidak_aktif';
      return null;
    }
    if (!row.iakProduct) return 'katalog_tidak_ada';
    if (row.iakProduct.status && row.iakProduct.status !== 'active') return 'katalog_tidak_aktif';
    return null;
  }

  async listCandidates(produkPascabayarId: number) {
    return this.prisma.produkPascabayarProvider.findMany({
      where: { produkPascabayarId },
      orderBy: { id: 'asc' },
      include: WITH_PROVIDER_DETAIL,
    });
  }

  private toSelection(
    row: {
      id: number;
      produkPascabayarId: number;
      provider: PascabayarProvider;
      providerSku: string;
      digiflazzProductId: number | null;
      iakProductId: number | null;
      iakProduct?: { type?: { type: string | null } | null } | null;
    },
    explicit: boolean,
  ): PascabayarSelection {
    return {
      produkPascabayarId: row.produkPascabayarId,
      provider: row.provider as PascabayarProviderCode,
      providerSku: row.providerSku,
      selectionId: row.id,
      digiflazzProductId: row.digiflazzProductId,
      iakProductId: row.iakProductId,
      providerType: row.iakProduct?.type?.type ?? null,
      explicit,
    };
  }
}
