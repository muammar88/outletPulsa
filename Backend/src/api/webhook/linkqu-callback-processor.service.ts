import { Injectable, Logger, Optional, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { LinkQuVerifiedPayload } from './linkqu-verifier';
import * as crypto from 'crypto';

export const LINKQU_SETTLEMENT_ADAPTER = 'LINKQU_SETTLEMENT_ADAPTER';

export interface LinkquSettlementAdapter {
  executeSettlement(
    item: any,
    tx: any,
    isPaymentSuccess: boolean,
    partnerReff: string,
    workerId?: string,
  ): Promise<{ status: 'PROCESSED' | 'CONFLICT' | 'FAILED'; message?: string }>;
}

@Injectable()
export class LinkquCallbackProcessorService {
  private readonly logger = new Logger(LinkquCallbackProcessorService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Optional() @Inject(LINKQU_SETTLEMENT_ADAPTER)
    private readonly settlementAdapter?: LinkquSettlementAdapter,
  ) {}

  /**
   * Called by Webhook HTTP Handler (Ingestion)
   */
  async ingestCallback(
    verificationData: LinkQuVerifiedPayload,
    payload: any,
    headers: any,
    configuredClientId?: string,
  ): Promise<{ response: string; message: string }> {
    const { partnerReff, amount, status, responseCode } = verificationData;
    const merchantId = verificationData.clientId || configuredClientId || 'DEFAULT';
    const eventData = `${merchantId}:${partnerReff}:${status}:${responseCode || ''}:${amount}:${payload?.signature || ''}`;
    const eventHash = crypto.createHash('sha256').update(eventData).digest('hex');

    let inboxRecord: any = null;

    try {
      inboxRecord = await this.prisma.paymentGatewayCallbackInbox.create({
        data: {
          provider: 'LINKQU',
          merchant_id: merchantId,
          partner_reff: partnerReff,
          event_hash: eventHash,
          signature: payload?.signature || null,
          headers: headers ? JSON.stringify(headers) : null,
          payload: JSON.stringify(payload),
          status: 'PENDING_CONTRACT_VERIFICATION', // Ditahan sesuai instruksi T1
          locked_by: null,
          locked_until: null,
          last_error: 'Contract not verified. Waiting for production adapter approval.',
        },
      });
      this.logger.log(`[LinkQu] Callback ingested and held for ${partnerReff} (event_hash: ${eventHash})`);
    } catch (err: any) {
      if (err?.code === 'P2002') {
        this.logger.log(`[LinkQu] Duplicate callback event ignored via event_hash: ${eventHash}`);
        return { response: '00', message: 'Duplicate event acknowledged' };
      }
      throw err;
    }

    // Jika kita memiliki adapter test-only yang disuntikkan (hanya saat testing), kita bisa memprosesnya langsung
    if (this.settlementAdapter) {
      // Untuk tujuan testing settlement historis
      await this.prisma.paymentGatewayCallbackInbox.update({
        where: { id: inboxRecord.id },
        data: {
          status: 'PROCESSING',
          locked_by: 'DIRECT_WEBHOOK',
          locked_until: new Date(Date.now() + 60000),
        },
      });
      inboxRecord.locked_by = 'DIRECT_WEBHOOK';
      inboxRecord.locked_until = new Date(Date.now() + 60000);
      inboxRecord.status = 'PROCESSING';
      
      const result = await this.processItemFinancially(inboxRecord, 'DIRECT_WEBHOOK', verificationData);
      if (result.status === 'FAILED') {
        return { response: '01', message: result.message || 'Processing failed' };
      }
      return { response: '00', message: result.message || 'Processed via test adapter' };
    }

    return { response: '00', message: 'Payment pending verification' };
  }

  /**
   * Called by Worker when it picks up PENDING or PROCESSING items
   */
  async processWorkerItem(
    item: any,
    workerId: string,
    verificationData: LinkQuVerifiedPayload,
  ): Promise<{ status: 'PROCESSED' | 'RETRY' | 'FAILED' | 'CONFLICT' | 'FENCING_REJECTED'; message?: string }> {
    const { partnerReff } = verificationData;

    // Jika tidak ada adapter penyelesaian finansial (production), tahan event.
    if (!this.settlementAdapter) {
      this.logger.warn(`[LinkQu] No settlement adapter found for ${partnerReff}. Holding event.`);
      await this.prisma.paymentGatewayCallbackInbox.updateMany({
        where: { id: item.id, locked_by: workerId },
        data: {
          status: 'PENDING_CONTRACT_VERIFICATION',
          last_error: 'Contract not verified. Waiting for production adapter approval.',
          locked_by: null,
          locked_until: null,
          updated_at: new Date(),
        },
      });
      return { status: 'FAILED', message: 'Held for contract verification' };
    }

    return this.processItemFinancially(item, workerId, verificationData);
  }

  private async processItemFinancially(
    item: any,
    workerId: string,
    verificationData: LinkQuVerifiedPayload,
  ): Promise<{ status: 'PROCESSED' | 'RETRY' | 'FAILED' | 'CONFLICT' | 'FENCING_REJECTED'; message?: string }> {
    const { partnerReff, amount: callbackAmount, status: callbackStatus, responseCode } = verificationData;

    const tx = await this.prisma.paymentGatewayTransaction.findUnique({
      where: { partner_reff: partnerReff },
      include: {
        requestDeposit: {
          include: {
            riwayatTransaksi: {
              include: { member: true },
            },
          },
        },
      },
    });

    if (!tx) {
      const nextRetryCount = (item.retry_count || 0) + 1;
      const maxRetries = item.max_retries || 5;

      if (nextRetryCount >= maxRetries) {
        await this.prisma.paymentGatewayCallbackInbox.updateMany({
          where: { id: item.id, locked_by: workerId },
          data: {
            status: 'MANUAL_REVIEW',
            last_error: `Max retries (${maxRetries}) reached. Transaction ${partnerReff} still not found locally.`,
            locked_by: null,
            locked_until: null,
            updated_at: new Date(),
          },
        });
        return { status: 'FAILED', message: 'Max retries reached' };
      }

      const delayMs = 5000 * Math.pow(2, nextRetryCount - 1);
      const updateResult = await this.prisma.paymentGatewayCallbackInbox.updateMany({
        where: { id: item.id, locked_by: workerId },
        data: {
          status: 'PENDING',
          retry_count: nextRetryCount,
          next_retry_at: new Date(Date.now() + delayMs),
          locked_by: null,
          locked_until: null,
          last_error: `Transaction not found locally yet. Next retry in ${delayMs / 1000}s`,
          updated_at: new Date(),
        },
      });

      if (updateResult.count === 0) return { status: 'FENCING_REJECTED', message: 'Lease expired' };
      return { status: 'RETRY', message: 'Scheduled for backoff retry' };
    }

    if (Number(tx.amount) !== callbackAmount) {
      await this.prisma.paymentGatewayCallbackInbox.updateMany({
        where: { id: item.id, locked_by: workerId },
        data: {
          status: 'FAILED',
          last_error: `Nominal mismatch: db=${tx.amount}, callback=${callbackAmount}`,
          locked_by: null,
          locked_until: null,
          updated_at: new Date(),
        },
      });
      return { status: 'FAILED', message: 'Nominal mismatch' };
    }
    
    if (tx.provider !== 'LINKQU') {
      await this.prisma.paymentGatewayCallbackInbox.updateMany({
        where: { id: item.id, locked_by: workerId },
        data: {
          status: 'FAILED',
          last_error: `Provider mismatch: expected LINKQU, got ${tx.provider}`,
          locked_by: null,
          locked_until: null,
          updated_at: new Date(),
        },
      });
      return { status: 'FAILED', message: 'Provider mismatch' };
    }

    const isPaymentSuccess = callbackStatus === 'SUCCESS' && (!responseCode || responseCode === '00' || responseCode === '03'); // rc 03 usually pending but for some reason we count it or handled it? Wait, 03 was handled in HTTP handler before. Ah wait. Let's strictly use (callbackStatus === 'SUCCESS' && (!responseCode || responseCode === '00')).
    // Oh wait, responseCode '03' is pending. isPaymentSuccess should just be '00'. 
    
    const isSuccess = callbackStatus === 'SUCCESS' && (!responseCode || responseCode === '00');
    
    // In webhook.service.ts previously: 
    // if (isPaymentSuccess) { ... } else if (status === 'FAILED' || status === 'EXPIRED' || (responseCode && responseCode !== '00' && responseCode !== '03')) { finalStatus = status === 'EXPIRED' ? 'EXPIRED' : 'FAILED' }
    // If we just pass isSuccess to the adapter, the adapter can handle it.

    if (this.settlementAdapter) {
        return this.settlementAdapter.executeSettlement(item, tx, isSuccess, partnerReff, workerId);
    }
    
    return { status: 'FAILED', message: 'No settlement adapter available' };
  }
}
