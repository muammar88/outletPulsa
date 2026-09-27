import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { SocketService } from '../../socket/socket.service';
import { PengumumanService } from '../../pengumuman/pengumuman.service';
import { LinkquSettlementAdapter as LinkquSettlementAdapterContract } from './linkqu-callback-processor.service';

/**
 * Adapter settlement PRODUKSI untuk callback LinkQu.
 *
 * Berbeda dari adapter test-only, adapter ini di-daftarkan pada WebhookModule
 * (token LINKQU_SETTLEMENT_ADAPTER) sehingga jalur produksi benar-benar dapat
 * menyelesaikan pembayaran tanpa perlakuan khusus test.
 *
 * Prinsip:
 * 1. Seluruh perubahan (klaim gateway PENDING->SUCCESS bersyarat, update deposit,
 *    increment saldo, ledger, kaitan settlement_ledger_id, penutupan inbox)
 *    dilakukan dalam SATU transaksi database. Jika ada yang gagal, semuanya rollback.
 * 2. Klaim bersyarat `updateMany({ where: { id, status: 'PENDING' } })` mencegah
 *    kredit ganda oleh worker/callback/inquiry paralel.
 * 3. `settlement_ref` deterministik + constraint unik database menjadi jaring kedua.
 * 4. Notifikasi/socket hanya dilakukan SETELAH commit, dan kegagalannya tidak
 *    mempengaruhi kredit.
 */
@Injectable()
export class LinkquSettlementAdapter implements LinkquSettlementAdapterContract {
  private readonly logger = new Logger(LinkquSettlementAdapter.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly socketService: SocketService,
    private readonly pengumumanService: PengumumanService,
  ) {}

  async executeSettlement(
    item: any,
    tx: any,
    isPaymentSuccess: boolean,
    partnerReff: string,
    workerId?: string,
    verificationStatus?: 'SUCCESS' | 'FAILED' | 'EXPIRED' | 'PENDING',
  ): Promise<{ status: 'PROCESSED' | 'CONFLICT' | 'FAILED'; message?: string }> {
    // GATE KREDIT: selama kontrak autentikasi callback LinkQu belum terbukti resmi, kredit
    // otomatis DITAHAN. Otorisasi diberikan secara eksplisit lewat env setelah verifikasi kontrak.
    // Event tetap tersimpan dan akan diproses ulang saat otorisasi aktif.
    if (isPaymentSuccess && !this.isSettlementAuthorized()) {
      await this.holdForContractVerification(item, workerId);
      this.logger.warn(
        `[LinkquSettlementAdapter] Kredit ditahan untuk ${partnerReff}: kontrak callback belum terverifikasi.`,
      );
      return { status: 'FAILED', message: 'Held for contract verification' };
    }

    const deterministicSettleRef = `SETTLE-LINKQU-${partnerReff}`;
    const statusFromCallback =
      verificationStatus ||
      (isPaymentSuccess
        ? 'SUCCESS'
        : (() => {
            try {
              const parsed = item.payload ? JSON.parse(item.payload) : {};
              const status = String(parsed.status || '').toUpperCase();
              return status === 'EXPIRED' ? 'EXPIRED' : status === 'PENDING' ? 'PENDING' : 'FAILED';
            } catch {
              return 'FAILED';
            }
          })());

    try {
      let settlementResult: 'PROCESSED' | 'CONFLICT' = 'PROCESSED';
      let didSettleDeposit = false;

      await this.prisma.$transaction(async (prisma) => {
        // A. Tutup inbox dengan fencing token (worker) atau tanpa fencing (langsung HTTP).
        if (workerId) {
          const inboxFence = await prisma.paymentGatewayCallbackInbox.updateMany({
            where: {
              id: item.id,
              locked_by: workerId,
              locked_until: { gte: new Date() },
            },
            data: {
              status: 'PROCESSED',
              processed_at: new Date(),
              locked_by: null,
              locked_until: null,
              updated_at: new Date(),
            },
          });

          if (inboxFence.count === 0) {
            throw new Error(`Fencing token violation: lease expired for inbox ${item.id}`);
          }
        } else {
          await prisma.paymentGatewayCallbackInbox.updateMany({
            where: { id: item.id },
            data: {
              status: 'PROCESSED',
              processed_at: new Date(),
              locked_by: null,
              locked_until: null,
              updated_at: new Date(),
            },
          });
        }

        if (isPaymentSuccess) {
          // B. Klaim gateway PENDING -> SUCCESS secara bersyarat.
          const claim = await prisma.paymentGatewayTransaction.updateMany({
            where: { id: tx.id, status: 'PENDING' },
            data: {
              status: 'SUCCESS',
              settlement_ref: deterministicSettleRef,
              updated_at: new Date(),
            },
          });

          if (claim.count === 0) {
            const currentTx = await prisma.paymentGatewayTransaction.findUnique({
              where: { id: tx.id },
            });

            if (currentTx?.status === 'SUCCESS') {
              // Sudah diselesaikan pihak lain; idempoten, tidak ada kredit kedua.
              return;
            }

            if (currentTx?.status === 'FAILED' || currentTx?.status === 'EXPIRED') {
              await prisma.paymentGatewayCallbackInbox.updateMany({
                where: { id: item.id },
                data: { status: 'CONFLICT', last_error: `Late SUCCESS after ${currentTx.status}` },
              });

              await prisma.activityLog.create({
                data: {
                  action: 'LATE_SUCCESS_SETTLEMENT_CONFLICT',
                  entity: 'PaymentGatewayTransaction',
                  entityId: String(tx.id),
                  description: `Adapter detected late LinkQu SUCCESS for ${partnerReff} with status ${currentTx.status}`,
                },
              });

              settlementResult = 'CONFLICT';
              return;
            }
            return;
          }

          // C. Validasi relasi wajib dan efek saldo untuk DEPOSIT.
          if (tx.reference_type === 'DEPOSIT') {
            const deposit = tx.requestDeposit;
            if (!deposit) {
              throw new Error(`Mandatory relation requestDeposit missing for DEPOSIT ${partnerReff}`);
            }

            const member = deposit.riwayatTransaksi?.member;
            if (!member) {
              throw new Error(`Mandatory relation member missing for deposit ${deposit.id}`);
            }

            if (deposit.status !== 'proses') {
              throw new Error(`Invalid deposit status transition: found '${deposit.status}', expected 'proses'`);
            }

            const nominal = deposit.nominal || 0;
            if (nominal <= 0) {
              throw new Error(`Invalid deposit nominal: ${nominal}`);
            }

            await prisma.requestDeposit.update({
              where: { id: deposit.id },
              data: { status: 'sukses', waktuKirim: new Date() },
            });

            const updatedMember = await prisma.member.update({
              where: { id: member.id },
              data: { saldo: { increment: nominal } },
            });

            const saldoSesudah = updatedMember.saldo ?? 0;
            const saldoSebelum = saldoSesudah - nominal;

            const newLedger = await prisma.riwayatSaldo.create({
              data: {
                kode: deposit.kode || `DEP-${deposit.id}`,
                member_id: member.id,
                nominal: nominal,
                saldo_sebelumnya: saldoSebelum,
                saldo_setelahnya: saldoSesudah,
                status: 'deposit',
                settlement_ref: deterministicSettleRef,
                ket: `Deposit via LinkQu (${tx.payment_method}) Sukses`,
                riwayat_transaksi_id: deposit.riwayatTransaksiId || undefined,
              },
            });

            await prisma.paymentGatewayTransaction.update({
              where: { id: tx.id },
              data: { settlement_ledger_id: newLedger.id },
            });

            didSettleDeposit = true;
          }
        } else if (statusFromCallback === 'PENDING') {
          settlementResult = 'PROCESSED';
        } else {
          const finalStatus = statusFromCallback === 'EXPIRED' ? 'EXPIRED' : 'FAILED';
          const claim = await prisma.paymentGatewayTransaction.updateMany({
            where: { id: tx.id, status: 'PENDING' },
            data: { status: finalStatus, updated_at: new Date() },
          });

          if (claim.count > 0 && tx.reference_type === 'DEPOSIT' && tx.requestDeposit) {
            if (tx.requestDeposit.status === 'proses') {
              await prisma.requestDeposit.update({
                where: { id: tx.requestDeposit.id },
                data: { status: 'gagal', alasanPenolakan: 'Payment Failed or Expired via LinkQu' },
              });
            }
          }
        }
      });

      // Efek samping hanya setelah commit sukses.
      if (settlementResult === 'PROCESSED' && didSettleDeposit) {
        const member = tx.requestDeposit?.riwayatTransaksi?.member;
        if (member) {
          this.socketService.emitTransactionUpdated(member.id, {
            transactionId: partnerReff,
            status: 'sukses',
            updatedAt: new Date(),
          });

          this.pengumumanService
            .sendTransactionStatus(
              member.id,
              'Deposit Berhasil',
              `Deposit sebesar Rp ${(tx.requestDeposit?.nominal || 0).toLocaleString('id-ID')} via ${tx.payment_method} telah berhasil ditambahkan ke saldo Anda.`,
              {
                reference_id: String(tx.requestDeposit?.id || tx.uuid),
                status: 'sukses',
              },
              'deposit',
            )
            .catch((e) => this.logger.error('Failed to send deposit success FCM:', e));
        }
      } else if (settlementResult === 'PROCESSED' && statusFromCallback === 'PENDING') {
        return { status: settlementResult, message: 'Payment pending' };
      }

      return { status: settlementResult };
    } catch (err: any) {
      const retryCount = (item.retry_count || 0) + 1;
      const maxRetries = item.max_retries || 5;
      const exhausted = retryCount >= maxRetries;
      const delayMs = 5000 * Math.pow(2, retryCount - 1);

      this.logger.error(
        `[LinkquSettlementAdapter] Settlement failed for item ${item.id}: ${err.message}`,
      );

      // Fencing: hanya boleh mengubah baris inbox yang MASIH milik lease kita dan belum final.
      // Worker lama yang kehilangan lease tidak boleh menimpa worker baru / event yang sudah selesai.
      const fenceWhere: any = { id: item.id, status: 'PROCESSING' };
      if (workerId) fenceWhere.locked_by = workerId;

      const requeued = await this.prisma.paymentGatewayCallbackInbox.updateMany({
        where: fenceWhere,
        data: {
          status: exhausted ? 'MANUAL_REVIEW' : 'PENDING',
          retry_count: retryCount,
          next_retry_at: exhausted ? new Date() : new Date(Date.now() + delayMs),
          last_error: err.message,
          locked_by: null,
          locked_until: null,
          updated_at: new Date(),
        },
      });
      if (requeued.count === 0) {
        this.logger.warn(
          `[LinkquSettlementAdapter] Lewati requeue inbox ${item.id}: lease bukan milik worker ini atau event sudah final.`,
        );
      }
      return { status: 'FAILED', message: err.message };
    }
  }

  private isSettlementAuthorized(): boolean {
    return process.env.LINKQU_CALLBACK_SETTLEMENT_AUTHORIZED === 'true';
  }

  private async holdForContractVerification(item: any, workerId?: string) {
    const fenceWhere: any = { id: item.id, status: 'PROCESSING' };
    if (workerId) fenceWhere.locked_by = workerId;

    // Ditahan sebagai PENDING dengan retry tertunda supaya otomatis diproses begitu otorisasi aktif,
    // tanpa pernah mengkredit selama gate masih tertutup.
    await this.prisma.paymentGatewayCallbackInbox
      .updateMany({
        where: fenceWhere,
        data: {
          status: 'PENDING',
          next_retry_at: new Date(Date.now() + 10 * 60 * 1000),
          last_error:
            'Kredit ditahan: kontrak autentikasi callback LinkQu belum diverifikasi resmi (set LINKQU_CALLBACK_SETTLEMENT_AUTHORIZED=true setelah verifikasi).',
          locked_by: null,
          locked_until: null,
          updated_at: new Date(),
        },
      })
      .catch(() => undefined);
  }
}
