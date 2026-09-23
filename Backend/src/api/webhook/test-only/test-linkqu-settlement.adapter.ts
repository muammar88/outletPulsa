import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { SocketService } from '../../../socket/socket.service';
import { PengumumanService } from '../../../pengumuman/pengumuman.service';
import { LinkquSettlementAdapter } from '../linkqu-callback-processor.service';

@Injectable()
export class TestLinkquSettlementAdapter implements LinkquSettlementAdapter {
  private readonly logger = new Logger(TestLinkquSettlementAdapter.name);

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
  ): Promise<{ status: 'PROCESSED' | 'CONFLICT' | 'FAILED'; message?: string }> {
    const deterministicSettleRef = `SETTLE-LINKQU-${partnerReff}`;
    const parsedPayload = item.payload ? JSON.parse(item.payload) : {};
    const statusFromCallback = isPaymentSuccess ? 'SUCCESS' : (parsedPayload.status === 'EXPIRED' ? 'EXPIRED' : (parsedPayload.status === 'PENDING' ? 'PENDING' : 'FAILED'));

    try {
      let settlementResult: 'PROCESSED' | 'CONFLICT' = 'PROCESSED';

      await this.prisma.$transaction(async (prisma) => {
        // A. Fencing Token Check if called from Worker
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
           // Direct from HTTP
           await prisma.paymentGatewayCallbackInbox.update({
             where: { id: item.id },
             data: {
               status: 'PROCESSED',
               processed_at: new Date(),
               locked_by: null,
               locked_until: null,
             }
           });
        }

        if (isPaymentSuccess) {
          // B. Klaim Gateway PENDING -> SUCCESS
          const claim = await prisma.paymentGatewayTransaction.updateMany({
            where: {
              id: tx.id,
              status: 'PENDING',
            },
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

          // C. Validasi Relasi Wajib DEPOSIT
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
          }
        } else if (statusFromCallback === 'PENDING') {
          // Do nothing for PENDING
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

      if (settlementResult === 'PROCESSED' && isPaymentSuccess) {
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
      this.logger.error(`[TestLinkquSettlementAdapter] Error during atomic settlement of item ${item.id}: ${err.message}`);
      await this.prisma.paymentGatewayCallbackInbox.updateMany({
        where: { id: item.id },
        data: {
          status: 'PENDING',
          last_error: err.message,
          locked_by: null,
          locked_until: null,
          updated_at: new Date(),
        },
      });
      return { status: 'FAILED', message: err.message };
    }
  }
}
