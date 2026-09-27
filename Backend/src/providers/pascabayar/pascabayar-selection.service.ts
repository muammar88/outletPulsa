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

/**
 * Resolusi provider/SKU aktif untuk sebuah produk pascabayar.
 *
 * Urutan:
 * 1. Pemilihan eksplisit admin (isActive = true).
 * 2. Kandidat eksplisit tanpa penanda aktif (deterministik id terkecil).
 * 3. Fallback pemetaan IAK lama (IakPascabayarProduct.produkPascabayarId).
 *
 * Hasil selalu deterministik; tidak pernah memilih `findFirst` tanpa urutan.
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
    if (active && active.providerSku) {
      return this.toSelection(active, true);
    }

    const candidate = await this.prisma.produkPascabayarProvider.findFirst({
      where: { produkPascabayarId },
      orderBy: { id: 'asc' },
      include: WITH_PROVIDER_DETAIL,
    });
    if (candidate && candidate.providerSku) {
      this.logger.warn(
        `[PASCA] Produk ${produkPascabayarId} belum punya provider aktif eksplisit; memakai kandidat deterministik ${candidate.provider}/${candidate.providerSku}`,
      );
      return this.toSelection(candidate, false);
    }

    const legacyIak = await this.prisma.iakPascabayarProduct.findFirst({
      where: { produkPascabayarId, status: 'active' },
      orderBy: { id: 'asc' },
      include: { type: true },
    });
    if (legacyIak && legacyIak.code) {
      this.logger.warn(
        `[PASCA] Produk ${produkPascabayarId} memakai fallback pemetaan IAK legacy (${legacyIak.code}). Segera hubungkan pemetaan eksplisit di panel admin.`,
      );
      return {
        produkPascabayarId,
        provider: 'IAK',
        providerSku: legacyIak.code,
        selectionId: null,
        digiflazzProductId: null,
        iakProductId: legacyIak.id,
        providerType: legacyIak.type?.type ?? null,
        explicit: false,
      };
    }

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
