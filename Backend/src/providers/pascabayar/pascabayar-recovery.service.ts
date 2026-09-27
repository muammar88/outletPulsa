import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { PascabayarFinalizerService } from './pascabayar-finalizer.service';
import { PascabayarRouterService } from './pascabayar-router.service';
import { PascabayarProviderCode } from './pascabayar.types';

export interface PascabayarRecoverySummary {
  diperiksa: number;
  sukses: number;
  gagal: number;
  masihPending: number;
  butuhPenangananManual: number;
}

/** Penanda di kolom providerStatus agar baris tidak disapu ulang setiap siklus. */
export const PASCA_STATUS_PERLU_MANUAL = 'PERLU_PENANGANAN_MANUAL';

/**
 * Pemulihan transaksi pascabayar yang sudah dikirim ke provider tetapi belum
 * punya status terminal (timeout, koneksi putus, callback hilang).
 *
 * - Hanya menyentuh transaksi yang sudah pernah dicoba bayar (`paymentAttemptedAt`).
 * - Idempotent: finalisasi lewat PascabayarFinalizerService (klaim `status = proses`).
 * - Menghormati jeda minimal 60 detik provider untuk data/transaksi yang sama.
 * - Punya batas percobaan; setelah habis, transaksi ditandai butuh penanganan manual,
 *   bukan otomatis dianggap gagal/refund.
 */
@Injectable()
export class PascabayarRecoveryService {
  private readonly logger = new Logger(PascabayarRecoveryService.name);

  static readonly MIN_JEDA_MS = 60_000;
  static readonly MAKS_UMUR_MS = 3 * 24 * 60 * 60 * 1000;
  static readonly MAKS_PERCOBAAN = 10;
  static readonly BATCH = 25;

  constructor(
    private readonly prisma: PrismaService,
    private readonly router: PascabayarRouterService,
    private readonly finalizer: PascabayarFinalizerService,
  ) {}

  async recoverPending(limit: number = PascabayarRecoveryService.BATCH): Promise<PascabayarRecoverySummary> {
    const now = Date.now();
    const rows = await this.prisma.transactionPascabayar.findMany({
      where: {
        status: 'proses',
        paymentAttemptedAt: { not: null },
        provider: { not: null },
        providerSku: { not: null },
        nomorTujuan: { not: null },
        trId: { not: null },
        updatedAt: { lte: new Date(now - PascabayarRecoveryService.MIN_JEDA_MS) },
        OR: [{ providerStatus: null }, { providerStatus: { not: PASCA_STATUS_PERLU_MANUAL } }],
      },
      orderBy: { updatedAt: 'asc' },
      take: limit,
    });

    const ringkasan: PascabayarRecoverySummary = {
      diperiksa: rows.length,
      sukses: 0,
      gagal: 0,
      masihPending: 0,
      butuhPenangananManual: 0,
    };

    for (const trx of rows) {
      const payload = this.bacaPayload(trx.inquiryPayload);
      const percobaan = Number(payload.recoveryAttempts ?? 0);

      if (percobaan >= PascabayarRecoveryService.MAKS_PERCOBAAN) {
        await this.tandaiManual(trx.id, payload, percobaan, 'Batas percobaan cek status tercapai');
        ringkasan.butuhPenangananManual++;
        continue;
      }

      if (now - trx.createdAt.getTime() > PascabayarRecoveryService.MAKS_UMUR_MS) {
        await this.tandaiManual(trx.id, payload, percobaan, 'Transaksi lebih dari 3 hari belum terminal');
        ringkasan.butuhPenangananManual++;
        continue;
      }

      try {
        const adapter = this.router.getAdapter(trx.provider as PascabayarProviderCode);
        const hasil = await adapter.status({
          refId: trx.trId as string,
          sku: trx.providerSku as string,
          customerNo: trx.nomorTujuan as string,
          providerType: (payload.providerType as string | null) ?? null,
          additionalData: (payload.additionalData as Record<string, unknown> | null) ?? null,
        });

        if (hasil.status === 'sukses') {
          await this.finalizer.finalizeSuccess({
            transactionId: trx.id,
            sn: hasil.sn,
            providerRefId: hasil.providerRefId,
            actualBillAmount: hasil.actualBillAmount,
            actualProviderAdminFee: hasil.actualProviderAdminFee ?? (payload.providerAdminFee as number | null) ?? null,
            source: 'RECOVERY',
          });
          ringkasan.sukses++;
        } else if (hasil.definitiveFailure) {
          await this.finalizer.finalizeFailure({
            transactionId: trx.id,
            reason: hasil.message || 'Gagal berdasarkan pemulihan status provider',
            source: 'RECOVERY',
          });
          ringkasan.gagal++;
        } else {
          await this.catatPercobaan(trx.id, payload, percobaan + 1, hasil.status, hasil.rc);
          ringkasan.masihPending++;
        }
      } catch (error) {
        await this.catatPercobaan(trx.id, payload, percobaan + 1, 'error', null);
        this.logger.warn(`Pemulihan ${trx.trId} belum berhasil: ${(error as Error).message}`);
        ringkasan.masihPending++;
      }
    }

    if (ringkasan.diperiksa > 0) {
      this.logger.log(
        `Pemulihan pascabayar: ${ringkasan.diperiksa} diperiksa, ${ringkasan.sukses} sukses, ${ringkasan.gagal} gagal, ${ringkasan.masihPending} masih pending, ${ringkasan.butuhPenangananManual} perlu manual`,
      );
    }
    return ringkasan;
  }

  private bacaPayload(raw: unknown): Record<string, any> {
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      return raw as Record<string, any>;
    }
    return {};
  }

  private async catatPercobaan(
    id: number,
    payload: Record<string, any>,
    percobaan: number,
    providerStatus: string | null,
    rc: string | null,
  ) {
    await this.prisma.transactionPascabayar.updateMany({
      where: { id, status: 'proses' },
      data: {
        inquiryPayload: {
          ...payload,
          recoveryAttempts: percobaan,
          lastRecoveryAt: new Date().toISOString(),
          lastRecoveryRc: rc ?? undefined,
        } as any,
        providerStatus: providerStatus ?? undefined,
      },
    });
  }

  private async tandaiManual(
    id: number,
    payload: Record<string, any>,
    percobaan: number,
    alasan: string,
  ) {
    await this.prisma.transactionPascabayar.updateMany({
      where: { id, status: 'proses' },
      data: {
        providerStatus: PASCA_STATUS_PERLU_MANUAL,
        inquiryPayload: {
          ...payload,
          recoveryAttempts: percobaan,
          lastRecoveryAt: new Date().toISOString(),
          recoveryManualReason: alasan,
        } as any,
      },
    });
    this.logger.warn(`Transaksi pascabayar id=${id} ditandai perlu penanganan manual: ${alasan}`);
  }
}
