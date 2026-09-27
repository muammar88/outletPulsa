import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { PengumumanService } from '../../pengumuman/pengumuman.service';
import { SocketService } from '../../socket/socket.service';

export interface PascabayarFinalizeSuccessInput {
  transactionId: number;
  sn?: string | null;
  providerRefId?: string | null;
  actualBillAmount?: number | null;
  actualProviderAdminFee?: number | null;
  /** Biaya aktual yang dipotong provider (IAK: selling_price, Digiflazz: price). */
  providerCost?: number | null;
  /** Nomor bukti/referensi biller provider (mis. `noref` IAK), bukan ID inquiry. */
  providerBillRef?: string | null;
  /** Sumber finalisasi untuk audit: PAY_DIRECT, WEBHOOK_*, STATUS_CHECK. */
  source: string;
}

export interface PascabayarFinalizeFailureInput {
  transactionId: number;
  reason?: string | null;
  source: string;
}

export interface PascabayarFinalizeResult {
  applied: boolean;
  status: string;
  refunded?: boolean;
}

/**
 * Finalisasi transaksi pascabayar terpadu (satu pintu).
 *
 * Dipakai oleh respons bayar langsung, webhook, dan cek status. Semua jalur
 * idempotent lewat klaim bersyarat `status = proses`. Refund hanya terjadi bila
 * debit benar-benar sudah dilakukan dan tercatat di ledger.
 */
@Injectable()
export class PascabayarFinalizerService {
  private readonly logger = new Logger(PascabayarFinalizerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pengumumanService: PengumumanService,
    private readonly socketService: SocketService,
  ) {}

  async finalizeSuccess(input: PascabayarFinalizeSuccessInput): Promise<PascabayarFinalizeResult> {
    const tx = await this.prisma.transactionPascabayar.findUnique({ where: { id: input.transactionId } });
    if (!tx) return { applied: false, status: 'tidak_ditemukan' };
    if (tx.status === 'sukses') return { applied: false, status: 'sukses' };
    if (tx.status !== 'proses') return { applied: false, status: tx.status ?? 'tidak_diketahui' };

    // Sukses hanya sah bila debit sudah diklaim/tercatat. Endpoint status tidak
    // boleh mengubah inquiry yang belum dibayar menjadi sukses lokal.
    const debitRecorded =
      (tx.paymentAttemptedAt !== null && tx.paymentAttemptedAt !== undefined) ||
      (tx.saldo_sebelum !== null && tx.saldo_sebelum !== undefined);
    if (!debitRecorded) {
      this.logger.warn(
        `[PASCA] Finalisasi sukses ditolak id=${input.transactionId}: pembayaran belum diklaim/debit belum tercatat`,
      );
      return { applied: false, status: tx.status ?? 'proses' };
    }

    const payload = (tx.inquiryPayload as Record<string, unknown> | null) ?? {};
    const sn = input.sn ?? tx.serial_number ?? null;
    const total = tx.total ?? null;
    // Biaya AKTUAL hanya dari bukti pembayaran (input). Biaya dari respons inquiry
    // hanyalah ESTIMASI: harga inquiry belum membuktikan potongan deposit saat
    // pembayaran, jadi tidak boleh dihitung sebagai laba aktual.
    const actualProviderCost = input.providerCost ?? null;
    const estimatedProviderCost = (payload.providerCost as number | null | undefined) ?? null;
    const laba =
      total !== null && actualProviderCost !== null ? total - actualProviderCost : null;
    const actualProviderAdminFee = input.actualProviderAdminFee ?? null;
    const estimatedProviderAdminFee =
      (payload.providerAdminFee as number | null | undefined) ?? null;

    const claim = await this.prisma.transactionPascabayar.updateMany({
      where: { id: input.transactionId, status: 'proses' },
      data: {
        status: 'sukses',
        serial_number: sn ?? undefined,
        ket: sn ?? undefined,
        providerRefId: input.providerRefId ?? tx.providerRefId ?? undefined,
        noref: input.providerBillRef ?? tx.noref ?? undefined,
        providerStatus: 'sukses',
        laba: laba ?? undefined,
        ...(input.actualBillAmount !== null && input.actualBillAmount !== undefined
          ? { nominal: input.actualBillAmount }
          : {}),
        inquiryPayload: {
          ...(payload as any),
          ...(actualProviderCost !== null ? { actualProviderCost } : {}),
          ...(estimatedProviderCost !== null ? { estimatedProviderCost } : {}),
          ...(actualProviderAdminFee !== null ? { actualProviderAdminFee } : {}),
          ...(estimatedProviderAdminFee !== null ? { estimatedProviderAdminFee } : {}),
        } as any,
      },
    });
    if (claim.count === 0) {
      const recheck = await this.prisma.transactionPascabayar.findUnique({ where: { id: input.transactionId } });
      return { applied: false, status: recheck?.status ?? 'tidak_diketahui' };
    }

    this.logger.log(`[PASCA] Finalisasi sukses id=${input.transactionId} sumber=${input.source}`);
    // Notifikasi setelah commit tidak boleh mengubah hasil finalisasi sukses.
    await this.notify(tx, 'sukses', sn, false).catch((e) =>
      this.logger.error(`Gagal notifikasi sukses pascabayar: ${(e as Error).message}`),
    );
    return { applied: true, status: 'sukses' };
  }

  async finalizeFailure(input: PascabayarFinalizeFailureInput): Promise<PascabayarFinalizeResult> {
    const tx = await this.prisma.transactionPascabayar.findUnique({ where: { id: input.transactionId } });
    if (!tx) return { applied: false, status: 'tidak_ditemukan' };
    if (tx.status !== 'proses') return { applied: false, status: tx.status ?? 'tidak_diketahui' };

    const memberId = await this.resolveMemberId(tx);

    const result = await this.prisma.$transaction(async (p) => {
      const claim = await p.transactionPascabayar.updateMany({
        where: { id: input.transactionId, status: 'proses' },
        data: { status: 'gagal', providerStatus: 'gagal', ket: input.reason ?? tx.ket ?? undefined },
      });
      if (claim.count === 0) return { applied: false, refunded: false };

      // Baca ulang SETELAH klaim agar keadaan debit konsisten; callback yang
      // bersamaan tidak boleh memakai snapshot lama dan melewatkan refund.
      const fresh = await p.transactionPascabayar.findUnique({ where: { id: input.transactionId } });

      const debitOccurred = fresh?.saldo_sebelum !== null && fresh?.saldo_sebelum !== undefined;
      const total = fresh?.total ?? 0;
      if (!debitOccurred || !memberId || total <= 0 || fresh?.refundId) {
        return { applied: true, refunded: false };
      }

      const member = await p.member.findUnique({ where: { id: memberId } });
      if (!member) return { applied: true, refunded: false };

      // Penambahan saldo harus atomik (SET saldo = saldo + total). Menulis nilai
      // absolut hasil baca-lalu-tulis bisa menimpa topup/pembelian lain yang
      // commit bersamaan, karena baris member baru terkunci saat UPDATE.
      const updated = await p.member.update({
        where: { id: member.id },
        data: { saldo: { increment: total } },
        select: { saldo: true },
      });
      const after = updated?.saldo ?? (member.saldo ?? 0) + total;
      const before = after - total;
      const refundId = `RFND-PSC-${fresh?.id ?? input.transactionId}-${Date.now()}`;
      await p.riwayatSaldo.create({
        data: {
          kode: refundId,
          member_id: member.id,
          nominal: total,
          saldo_sebelumnya: before,
          saldo_setelahnya: after,
          status: 'pengembalian_dana',
          ket: `Refund pascabayar ${fresh?.trId ?? input.transactionId}`,
          riwayat_transaksi_id: fresh?.riwayatTransaksiId ?? undefined,
        },
      });
      await p.transactionPascabayar.update({ where: { id: input.transactionId }, data: { refundId } });
      return { applied: true, refunded: true };
    });

    if (result.applied) {
      this.logger.log(`[PASCA] Finalisasi gagal id=${tx.id} refund=${result.refunded} sumber=${input.source}`);
      // Notifikasi setelah commit tidak boleh mengubah hasil finalisasi.
      await this.notify(tx, 'gagal', null, result.refunded).catch((e) =>
        this.logger.error(`Gagal notifikasi gagal pascabayar: ${(e as Error).message}`),
      );
    }
    return { applied: result.applied, status: 'gagal', refunded: result.refunded };
  }

  private async resolveMemberId(tx: { memberId: number | null; riwayatTransaksiId: number | null }): Promise<number | null> {
    if (tx.memberId) return tx.memberId;
    if (!tx.riwayatTransaksiId) return null;
    const riwayat = await this.prisma.riwayatTransaksi.findUnique({ where: { id: tx.riwayatTransaksiId } });
    return riwayat?.memberId ?? null;
  }

  private async notify(
    tx: { id: number; trId: string | null; nomorTujuan: string | null },
    status: 'sukses' | 'gagal',
    sn: string | null,
    refunded: boolean,
  ): Promise<void> {
    const memberId = await this.resolveMemberId(tx as any);
    if (!memberId) return;
    const referenceId = tx.trId || String(tx.id);

    try {
      this.socketService.emitTransactionUpdated(memberId, {
        transactionId: referenceId,
        status,
        sn: sn ?? undefined,
        updatedAt: new Date(),
      });
    } catch (error) {
      // Kegagalan socket tidak boleh menghentikan pengiriman push notification.
      this.logger.error(`Gagal emit socket pascabayar: ${(error as Error).message}`);
    }

    const title = status === 'sukses' ? 'Transaksi Pascabayar Berhasil' : 'Transaksi Pascabayar Gagal';
    const desc =
      status === 'sukses'
        ? `Pembayaran tagihan ${tx.nomorTujuan ?? ''} sukses. SN: ${sn ?? '-'}`
        : `Pembayaran tagihan ${tx.nomorTujuan ?? ''} gagal.${refunded ? ' Saldo dikembalikan.' : ''}`;

    await this.sendTransactionStatusWithRetry(memberId, title, desc, referenceId, status);
  }

  /**
   * Retry singkat untuk gangguan sementara setelah transaksi sudah di-commit.
   * Setelah seluruh percobaan gagal, caller hanya mencatat error dan tidak
   * membatalkan hasil transaksi yang sudah final.
   */
  private async sendTransactionStatusWithRetry(
    memberId: number,
    title: string,
    desc: string,
    referenceId: string,
    status: 'sukses' | 'gagal',
    maxAttempts = 3,
  ): Promise<void> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        await this.pengumumanService.sendTransactionStatus(
          memberId,
          title,
          desc,
          { reference_id: referenceId, status },
          'pascabayar',
        );
        return;
      } catch (error) {
        lastError = error;
        this.logger.warn(
          `Gagal kirim pengumuman pascabayar percobaan ${attempt}/${maxAttempts}: ${(error as Error).message}`,
        );
      }
    }
    throw lastError;
  }
}
