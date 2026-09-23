import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { PengumumanService } from '../../pengumuman/pengumuman.service';
import { SocketService } from '../../socket/socket.service';

export interface FinalizeTransaksiParams {
  transactionId: number;
  targetStatus: 'sukses' | 'gagal';
  sn?: string;
  actualPurchasePrice?: number;
  provider?: string;
  ket?: string;
  source?: string;
}

export interface FinalizeTransaksiResult {
  success: boolean;
  finalized: boolean;
  alreadyFinal: boolean;
  status: string;
  message?: string;
  refundAmount?: number;
  transaction?: any;
}

@Injectable()
export class TransaksiFinalizerService {
  private readonly logger = new Logger(TransaksiFinalizerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pengumumanService: PengumumanService,
    private readonly socketService: SocketService,
  ) {}

  /**
   * Finalisasi transaksi prabayar secara atomik dan idempotent.
   * Menjamin transisi status proses -> sukses/gagal hanya dieksekusi 1 kali,
   * mencegah refund ganda jika terjadi eksekusi paralel (callback, polling, admin).
   *
   * B2 hardening:
   * - Identitas refund deterministik: REFUND-TRX-{id} (bukan Date.now())
   * - Validasi bukti debit historis sebelum refund
   * - Anti-duplikasi: cek refund_id sudah ada sebelum memproses
   * - Rollback atomik jika relasi member wajib hilang (throw di dalam $transaction)
   * - Rollback atomik jika ledger (riwayatSaldo) gagal dibuat
   * - Konflik status dicatat ke activityLog untuk rekonsiliasi manual (nol mutasi finansial)
   */
  async finalizeTransaction(params: FinalizeTransaksiParams): Promise<FinalizeTransaksiResult> {
    const { transactionId, targetStatus, sn, actualPurchasePrice, ket, source } = params;

    this.logger.log(
      `[Finalizer] Request finalize TRX #${transactionId} to '${targetStatus}' (source: ${source || 'UNKNOWN'}, sn: ${sn || '-'})`,
    );

    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        riwayatTransaksi: {
          include: { member: true },
        },
        produk: true,
        server: true,
      },
    });

    if (!transaction) {
      this.logger.warn(`[Finalizer] Transaction #${transactionId} not found`);
      return {
        success: false,
        finalized: false,
        alreadyFinal: false,
        status: 'not_found',
        message: 'Transaksi tidak ditemukan',
      };
    }

    // Cek apakah sudah berstatus final sebelumnya
    if (transaction.status === 'sukses' || transaction.status === 'gagal' || transaction.status === 'expired') {
      if (transaction.status === targetStatus) {
        // Jika sudah sama dan ada update serial number yang belum tercatat pada transaksi sukses
        if (targetStatus === 'sukses' && sn && !transaction.serial_number) {
          await this.prisma.transaction.update({
            where: { id: transactionId },
            data: {
              serial_number: String(sn),
              ket: ket || (sn.startsWith('SN') ? sn : `SN: ${sn}`),
            },
          });
        }
        return {
          success: true,
          finalized: false,
          alreadyFinal: true,
          status: transaction.status,
          message: `Transaksi sudah berstatus ${transaction.status}`,
          transaction,
        };
      }

      // B2: Konflik status — catat ke activityLog untuk rekonsiliasi manual (nol mutasi finansial)
      this.logger.warn(
        `[Finalizer] Status conflict for TRX #${transactionId}: current=${transaction.status}, target=${targetStatus}. Recording to activityLog.`,
      );

      this.prisma.activityLog
        .create({
          data: {
            action: 'TRANSACTION_STATUS_CONFLICT',
            entity: 'Transaction',
            entityId: String(transactionId),
            description:
              `Status konflik: TRX #${transactionId} sudah berstatus '${transaction.status}', ` +
              `target '${targetStatus}' diabaikan. Sumber: ${source || 'UNKNOWN'}. ` +
              `Perlu rekonsiliasi manual sebelum kredit/debit dilakukan.`,
          },
        })
        .catch((e) =>
          this.logger.error(`[Finalizer] Failed to write conflict log for TRX #${transactionId}:`, e),
        );

      return {
        success: true,
        finalized: false,
        alreadyFinal: true,
        status: transaction.status,
        message: `Konflik status: transaksi sudah ${transaction.status}, target ${targetStatus} diabaikan. Dicatat untuk rekonsiliasi.`,
        transaction,
      };
    }

    // Persiapkan data update
    const updateData: any = {
      status: targetStatus,
      updatedAt: new Date(),
    };

    let calculatedRefund = 0;
    if (targetStatus === 'sukses') {
      const realPrice =
        actualPurchasePrice !== undefined ? actualPurchasePrice : transaction.purchase_price || 0;
      const sellingPrice = transaction.selling_price || 0;
      const feeAgen = transaction.fee_agen || 0;
      const laba = sellingPrice - realPrice - feeAgen;

      updateData.purchase_price = realPrice;
      updateData.laba = laba;
      if (sn) {
        updateData.serial_number = String(sn);
        updateData.ket = ket || (sn.startsWith('SN') ? sn : `SN: ${sn}`);
      } else if (ket) {
        updateData.ket = ket;
      }
    } else if (targetStatus === 'gagal') {
      const feeAgen = transaction.fee_agen || 0;
      const sellingPrice = transaction.selling_price || 0;
      calculatedRefund = sellingPrice + feeAgen;

      if (ket) {
        updateData.ket = ket;
      } else if (sn) {
        updateData.ket = `Gagal: ${sn}`;
      }

      // B2: Anti-duplikasi — jika sudah ada refund_id, tidak ada refund kedua
      if (transaction.refund_id) {
        this.logger.warn(
          `[Finalizer] TRX #${transactionId} sudah memiliki refund_id='${transaction.refund_id}'. Refund kedua dibatalkan (idempoten).`,
        );
        calculatedRefund = 0;
      } else {
        // B2: Identitas refund deterministik dan unik per transaksi
        const refundId = `REFUND-TRX-${transaction.id}`;
        updateData.refund_id = refundId;

        // B2: Validasi bukti debit historis
        // Jika saldo_sebelum/saldo_sesudah null atau tidak menunjukkan pengurangan saldo,
        // berarti debit tidak terjadi -> tolak refund, catat audit, tetap finalisasi status saja
        const saldoSebelum = transaction.saldo_sebelum;
        const saldoSesudah = transaction.saldo_sesudah;
        const debitTerbukti =
          saldoSebelum !== null &&
          saldoSebelum !== undefined &&
          saldoSesudah !== null &&
          saldoSesudah !== undefined &&
          saldoSebelum > saldoSesudah;

        if (!debitTerbukti) {
          this.logger.warn(
            `[Finalizer][AUDIT:TANPA_BUKTI_DEBIT] TRX #${transactionId}: ` +
              `saldo_sebelum=${saldoSebelum}, saldo_sesudah=${saldoSesudah}. ` +
              `Refund Rp${calculatedRefund} dibatalkan — tidak ada bukti debit member.`,
          );
          this.prisma.activityLog
            .create({
              data: {
                action: 'REFUND_DITOLAK_TANPA_BUKTI_DEBIT',
                entity: 'Transaction',
                entityId: String(transactionId),
                description:
                  `TRX #${transactionId}: refund Rp${calculatedRefund} dibatalkan karena tidak ada bukti debit historis. ` +
                  `saldo_sebelum=${saldoSebelum}, saldo_sesudah=${saldoSesudah}. ` +
                  `Sumber: ${source || 'UNKNOWN'}. Perlu verifikasi manual.`,
              },
            })
            .catch((e) =>
              this.logger.error(`[Finalizer] Failed to write no-debit-proof log for TRX #${transactionId}:`, e),
            );
          calculatedRefund = 0;
          // Hapus refund_id dari updateData karena tidak ada refund
          delete updateData.refund_id;
        }
      }
    }

    // Eksekusi atomik menggunakan conditional update (klaim status 'proses')
    let finalized = false;
    let refundExecuted = 0;

    await this.prisma.$transaction(async (tx) => {
      const claim = await tx.transaction.updateMany({
        where: {
          id: transactionId,
          status: 'proses',
        },
        data: updateData,
      });

      if (claim.count === 0) {
        // Balapan konkurensi: proses lain telah memfinalisasi transaksi ini
        return;
      }

      finalized = true;

      // Jika gagal dan ada dana yang harus direfund
      if (targetStatus === 'gagal' && calculatedRefund > 0) {
        const member = transaction.riwayatTransaksi?.member;

        // B2: Rollback atomik jika relasi wajib hilang
        // Melempar error di dalam $transaction agar klaim status JUGA di-rollback.
        // Tanpa ini, transaksi bisa berakhir status=gagal tanpa refund (status palsu).
        if (!member) {
          throw new Error(
            `[Finalizer] TRX #${transactionId}: relasi member wajib tidak ditemukan. ` +
              `Seluruh $transaction di-rollback — status tidak berubah.`,
          );
        }

        const updatedMember = await tx.member.update({
          where: { id: member.id },
          data: { saldo: { increment: calculatedRefund } },
        });

        const saldoSesudahAfterRefund = updatedMember.saldo ?? 0;
        const saldoSebelumRefund = saldoSesudahAfterRefund - calculatedRefund;
        refundExecuted = calculatedRefund;

        // B2: Kode ledger identik dengan refund_id — deterministik, bukan Date.now()
        // Jika riwayatSaldo.create gagal (misal unique conflict), $transaction rollback otomatis
        await tx.riwayatSaldo.create({
          data: {
            kode: `REFUND-TRX-${transaction.id}`,
            member_id: member.id,
            nominal: calculatedRefund,
            saldo_sebelumnya: saldoSebelumRefund,
            saldo_setelahnya: saldoSesudahAfterRefund,
            status: 'deposit',
            riwayat_transaksi_id: transaction.riwayatTransaksiId,
            ket: `Pengembalian dana transaksi gagal ${transaction.nomorTujuan || ''} (${transaction.kode || transaction.id})`,
          },
        });

        await tx.riwayatTransaksi.create({
          data: {
            memberId: member.id,
            tipeTransaksi: 'terima_saldo',
          },
        });
      }
    });

    if (!finalized) {
      this.logger.log(`[Finalizer] TRX #${transactionId} was claimed by another concurrent process.`);
      const current = await this.prisma.transaction.findUnique({ where: { id: transactionId } });
      return {
        success: true,
        finalized: false,
        alreadyFinal: true,
        status: current?.status || 'proses',
        message: 'Transaksi sudah difinalisasi oleh proses lain secara bersamaan',
        transaction: current,
      };
    }

    this.logger.log(
      `[Finalizer] TRX #${transactionId} successfully finalized to '${targetStatus}'. Refund: ${refundExecuted}`,
    );

    // Kirim notifikasi Socket & FCM setelah DB transaction commit
    const member = transaction.riwayatTransaksi?.member;
    if (member) {
      this.socketService.emitTransactionUpdated(member.id, {
        transactionId: transaction.kode || transaction.id,
        status: targetStatus,
        sn: sn || transaction.serial_number || undefined,
        updatedAt: new Date(),
      });

      const statusTitle = targetStatus === 'sukses' ? 'Transaksi Berhasil' : 'Transaksi Gagal';
      const statusBody =
        targetStatus === 'sukses'
          ? `Pembelian ${transaction.produk?.name || 'Prabayar'} untuk ${transaction.nomorTujuan || ''} telah sukses. SN: ${sn || '-'}`
          : `Pembelian ${transaction.produk?.name || 'Prabayar'} untuk ${transaction.nomorTujuan || ''} gagal. Saldo telah dikembalikan.`;

      this.pengumumanService
        .sendTransactionStatus(
          member.id,
          statusTitle,
          statusBody,
          {
            reference_id: transaction.kode || String(transaction.id),
            status: targetStatus,
          },
          'prabayar',
        )
        .catch((e) => this.logger.error(`[Finalizer] Failed to send FCM for TRX #${transactionId}:`, e));
    }

    const updatedTrx = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { produk: true, server: true, riwayatTransaksi: true },
    });

    return {
      success: true,
      finalized: true,
      alreadyFinal: false,
      status: targetStatus,
      refundAmount: refundExecuted,
      transaction: updatedTrx,
    };
  }
}
