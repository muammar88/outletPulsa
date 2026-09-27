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

    const sn = input.sn ?? tx.serial_number ?? null;
    const nominal = tx.nominal ?? null;
    const total = tx.total ?? null;
    const providerAdmin = input.actualProviderAdminFee ?? null;
    const providerCommission = tx.comissionSnapshot ?? null;
    // Rumus laba eksplisit: laba = hargaJual - nominalTagihan - adminProvider + komisiProvider.
    const laba =
      total !== null && nominal !== null && providerAdmin !== null
        ? total - nominal - providerAdmin + (providerCommission ?? 0)
        : null;

    const claim = await this.prisma.transactionPascabayar.updateMany({
      where: { id: input.transactionId, status: 'proses' },
      data: {
        status: 'sukses',
        serial_number: sn ?? undefined,
        ket: sn ?? undefined,
        providerRefId: input.providerRefId ?? tx.providerRefId ?? undefined,
        providerStatus: 'sukses',
        laba: laba ?? undefined,
        ...(input.actualBillAmount !== null && input.actualBillAmount !== undefined
          ? { nominal: input.actualBillAmount }
          : {}),
      },
    });
    if (claim.count === 0) {
      const recheck = await this.prisma.transactionPascabayar.findUnique({ where: { id: input.transactionId } });
      return { applied: false, status: recheck?.status ?? 'tidak_diketahui' };
    }

    this.logger.log(`[PASCA] Finalisasi sukses id=${input.transactionId} sumber=${input.source}`);
    await this.notify(tx, 'sukses', sn, false);
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

      const debitOccurred = tx.saldo_sebelum !== null && tx.saldo_sebelum !== undefined;
      const total = tx.total ?? 0;
      if (!debitOccurred || !memberId || total <= 0 || tx.refundId) {
        return { applied: true, refunded: false };
      }

      const member = await p.member.findUnique({ where: { id: memberId } });
      if (!member) return { applied: true, refunded: false };

      const before = member.saldo ?? 0;
      const after = before + total;
      const refundId = `RFND-PSC-${tx.id}-${Date.now()}`;
      await p.member.update({ where: { id: member.id }, data: { saldo: after } });
      await p.riwayatSaldo.create({
        data: {
          kode: refundId,
          member_id: member.id,
          nominal: total,
          saldo_sebelumnya: before,
          saldo_setelahnya: after,
          status: 'pengembalian_dana',
          ket: `Refund pascabayar ${tx.trId ?? tx.id}`,
          riwayat_transaksi_id: tx.riwayatTransaksiId ?? undefined,
        },
      });
      await p.transactionPascabayar.update({ where: { id: tx.id }, data: { refundId } });
      return { applied: true, refunded: true };
    });

    if (result.applied) {
      this.logger.log(`[PASCA] Finalisasi gagal id=${tx.id} refund=${result.refunded} sumber=${input.source}`);
      await this.notify(tx, 'gagal', null, result.refunded);
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

    this.socketService.emitTransactionUpdated(memberId, {
      transactionId: referenceId,
      status,
      sn: sn ?? undefined,
      updatedAt: new Date(),
    });

    const title = status === 'sukses' ? 'Transaksi Pascabayar Berhasil' : 'Transaksi Pascabayar Gagal';
    const desc =
      status === 'sukses'
        ? `Pembayaran tagihan ${tx.nomorTujuan ?? ''} sukses. SN: ${sn ?? '-'}`
        : `Pembayaran tagihan ${tx.nomorTujuan ?? ''} gagal.${refunded ? ' Saldo dikembalikan.' : ''}`;

    await this.pengumumanService
      .sendTransactionStatus(memberId, title, desc, { reference_id: referenceId, status }, 'pascabayar')
      .catch((e) => this.logger.error(`Gagal kirim pengumuman pascabayar: ${(e as Error).message}`));
  }
}
