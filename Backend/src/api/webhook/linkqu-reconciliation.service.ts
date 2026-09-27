import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import * as crypto from 'crypto';

export type LinkquReconciledStatus = 'SUCCESS' | 'FAILED' | 'EXPIRED' | 'PENDING';

export interface LinkquReconcileResult {
  attempted: number;
  enqueued: number;
}

/**
 * Rekonsiliasi transaksi LinkQu yang masih PENDING lewat inquiry resmi provider.
 *
 * PENTING (kontrak belum terverifikasi):
 * - Fitur ini DEFAULT MATI. Aktifkan hanya setelah path/field inquiry LinkQu dipastikan dari
 *   dokumentasi resmi, lewat env:
 *     LINKQU_INQUIRY_ENABLED=true
 *     LINKQU_INQUIRY_PATH=/linkqu-partner/transaction/... (wajib)
 *     LINKQU_INQUIRY_STATUS_FIELD=status            (opsional)
 *     LINKQU_INQUIRY_SIGN_PATH=...                  (opsional, default dari path)
 *     LINKQU_INQUIRY_SIGN_RAW=...                   (opsional, default partner_reff+amount+client_id)
 *     LINKQU_INQUIRY_METHOD=POST                    (opsional)
 *     LINKQU_INQUIRY_MIN_AGE_MS / LINKQU_INQUIRY_DEBOUNCE_MS
 * - Hasil inquiry TIDAK mengkredit langsung. Status terminal dimasukkan sebagai event inbox
 *   `event_type=INQUIRY` supaya diselesaikan oleh jalur settlement yang sama (idempoten) dan
 *   tetap tunduk pada gate otorisasi kredit.
 */
@Injectable()
export class LinkquReconciliationService {
  private readonly logger = new Logger(LinkquReconciliationService.name);

  constructor(private readonly prisma: PrismaService) {}

  isEnabled(): boolean {
    return process.env.LINKQU_INQUIRY_ENABLED === 'true' && this.inquiryPath().length > 0;
  }

  private inquiryPath(): string {
    return (process.env.LINKQU_INQUIRY_PATH || '').trim();
  }

  private debounceMs(): number {
    return Number(process.env.LINKQU_INQUIRY_DEBOUNCE_MS || '60000') || 60000;
  }

  async reconcilePending(limit = 5): Promise<LinkquReconcileResult> {
    if (!this.isEnabled()) return { attempted: 0, enqueued: 0 };

    const minAgeMs = Number(process.env.LINKQU_INQUIRY_MIN_AGE_MS || '60000') || 60000;
    const cutoff = new Date(Date.now() - minAgeMs);

    const txs = await this.prisma.paymentGatewayTransaction.findMany({
      where: { provider: 'LINKQU', status: 'PENDING', created_at: { lte: cutoff } },
      orderBy: { updated_at: 'asc' }, // Ganti ke updated_at supaya semua mendapat giliran merata
      take: limit,
    });

    let attempted = 0;
    let enqueued = 0;
    for (const tx of txs) {
      const outcome = await this.reconcileTransaction(tx);
      if (outcome.attempted) attempted += 1;
      if (outcome.enqueued) enqueued += 1;
    }

    if (attempted > 0) {
      this.logger.log(`[LinkQu] Rekonsiliasi inquiry: ${attempted} diperiksa, ${enqueued} event dibuat.`);
    }
    return { attempted, enqueued };
  }

  /** Dipakai tombol cek status: inquiry untuk satu transaksi, tetap mematuhi jeda/cache. */
  async reconcileOne(partnerReff: string): Promise<{ attempted: boolean; status: LinkquReconciledStatus | null }> {
    if (!this.isEnabled()) return { attempted: false, status: null };

    const tx = await this.prisma.paymentGatewayTransaction.findUnique({
      where: { partner_reff: partnerReff },
    });
    if (!tx || tx.status !== 'PENDING') return { attempted: false, status: null };

    const outcome = await this.reconcileTransaction(tx);
    return { attempted: outcome.attempted, status: outcome.status };
  }

  private async reconcileTransaction(
    tx: any,
  ): Promise<{ attempted: boolean; enqueued: boolean; status: LinkquReconciledStatus | null }> {
    const meta = this.parseMetadata(tx.metadata);
    const lastAt = meta.last_inquiry_at ? Date.parse(meta.last_inquiry_at) : 0;
    if (lastAt && Date.now() - lastAt < this.debounceMs()) {
      return { attempted: false, enqueued: false, status: null };
    }

    await this.prisma.paymentGatewayTransaction.updateMany({
      where: { id: tx.id, status: 'PENDING' },
      data: { metadata: JSON.stringify({ ...meta, last_inquiry_at: new Date().toISOString() }) },
    });

    let inquiry: { status: LinkquReconciledStatus; clientId?: string; data?: any } | null = null;
    try {
      inquiry = await this.inquire(tx);
    } catch (e: any) {
      this.logger.warn(`[LinkQu] Inquiry gagal untuk ${tx.partner_reff}: ${e.message}`);
    }
    
    // Pemulihan instruksi pembayaran jika status masih PENDING dan data VA/QRIS ada dari provider
    if (inquiry?.status === 'PENDING' && inquiry?.data) {
      const responseData = inquiry.data;
      const paymentMethod = tx.payment_method?.toUpperCase() || '';
      
      const vaNumber = paymentMethod === 'VA' ? (responseData.virtual_account || responseData.va_number || null) : null;
      const qrisText = paymentMethod === 'QRIS' ? (responseData.qris_text || responseData.qr_content || null) : null;
      const checkoutUrl = paymentMethod === 'EWALLET' ? (responseData.checkout_url || responseData.url_checkout || null) : null;
      
      let updatedMeta = false;
      let newMeta = { ...meta };
      
      if (qrisText && !meta.qris_text) {
        newMeta.qris_text = qrisText;
        if (responseData.imageqris) newMeta.imageqris = responseData.imageqris;
        updatedMeta = true;
      }
      
      if (checkoutUrl && !meta.checkout_url) {
        newMeta.checkout_url = checkoutUrl;
        updatedMeta = true;
      }
      
      if ((vaNumber && !tx.virtual_account) || updatedMeta) {
        await this.prisma.paymentGatewayTransaction.update({
          where: { id: tx.id },
          data: {
            virtual_account: vaNumber || tx.virtual_account,
            metadata: JSON.stringify(newMeta),
          },
        });
      }
    }

    if (!inquiry || inquiry.status === 'PENDING') {
      return { attempted: true, enqueued: false, status: inquiry?.status ?? null };
    }

    const eventHash = crypto
      .createHash('sha256')
      .update(`INQUIRY:${tx.partner_reff}:${inquiry.status}:${Number(tx.amount)}`)
      .digest('hex');

    let enqueued = false;
    try {
      await this.prisma.paymentGatewayCallbackInbox.create({
        data: {
          provider: 'LINKQU',
          event_type: 'INQUIRY',
          merchant_id: inquiry.clientId || null,
          partner_reff: tx.partner_reff,
          event_hash: eventHash,
          payload: JSON.stringify({
            partner_reff: tx.partner_reff,
            amount: Number(tx.amount),
            status: inquiry.status,
            response_code: inquiry.status === 'SUCCESS' ? '00' : undefined,
            source: 'INQUIRY',
          }),
          status: 'PENDING',
          next_retry_at: new Date(),
        },
      });
      enqueued = true;
    } catch (e: any) {
      if (e?.code !== 'P2002') throw e;
    }

    return { attempted: true, enqueued, status: inquiry.status };
  }

  private parseMetadata(metadata: string | null): any {
    try {
      return JSON.parse(metadata || '{}');
    } catch {
      return {};
    }
  }

  private async inquire(tx: any): Promise<{ status: LinkquReconciledStatus; clientId?: string; data?: any }> {
    const pengaturan = await this.prisma.pengaturanUmum.findFirst();
    const clientId = (pengaturan?.linkqu_client_id || '').trim();
    const clientSecret = (pengaturan?.linkqu_client_secret || '').trim();
    const signatureKey = (pengaturan?.linkqu_signature_key || '').trim();
    const username = (pengaturan?.linkqu_merchant_code || 'LINKQU').trim();
    const pin = (pengaturan?.linkqu_pin || '').trim();
    if (!clientId || !clientSecret) {
      throw new Error('Kredensial LinkQu tidak lengkap');
    }

    const isSandbox = pengaturan?.linkqu_is_sandbox;
    let baseUrl = isSandbox ? pengaturan?.linkqu_base_url_dev : pengaturan?.linkqu_base_url_prod;
    if (!baseUrl) {
      baseUrl = isSandbox ? 'https://gateway-dev.linkqu.id' : 'https://api.linkqu.id';
    }
    baseUrl = String(baseUrl).replace(/\/+$/, '').replace(/\/linkqu-partner$/, '');

    const path = this.inquiryPath();
    const method = (process.env.LINKQU_INQUIRY_METHOD || 'POST').toUpperCase();
    const payload: any = { partner_reff: tx.partner_reff, username, pin };

    // Signature request inquiry mengikuti pola request create (ASUMSI — lihat catatan kontrak).
    const signPath = (process.env.LINKQU_INQUIRY_SIGN_PATH || path.replace('/linkqu-partner', '')).trim();
    const rawString =
      process.env.LINKQU_INQUIRY_SIGN_RAW ||
      `${String(tx.partner_reff)}${String(tx.amount)}${String(clientId)}`;
    const buildkey = signPath + method + rawString.replace(/[^0-9a-zA-Z]/g, '').toLowerCase();
    if (signatureKey) {
      payload.signature = crypto.createHmac('sha256', signatureKey).update(buildkey).digest('hex');
    }

    const response = await this.withTimeout(
      fetch(`${baseUrl}${path}`, {
        method,
        headers: {
          'client-id': clientId,
          'client-secret': clientSecret,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }),
      15000,
    );
    const text = await this.withTimeout(response.text(), 15000);
    const data = JSON.parse(text);

    const statusField = process.env.LINKQU_INQUIRY_STATUS_FIELD || 'status';
    const rawStatus = String(data?.[statusField] ?? '').toUpperCase();
    let status = this.normalizeStatus(rawStatus);
    
    // Validasi respons SUCCESS: pastikan referensi dan nominal cocok dengan database kita
    if (status === 'SUCCESS') {
      const respAmount = Number(data?.amount);
      const respPartnerReff = String(data?.partner_reff);
      const respClientId = String(data?.client_id);
      
      const isAmountValid = respAmount === Number(tx.amount) || !data?.amount;
      const isReffValid = respPartnerReff === String(tx.partner_reff) || !data?.partner_reff;
      const isClientValid = respClientId === clientId || !data?.client_id;
      
      if (!isAmountValid || !isReffValid || !isClientValid) {
        this.logger.error(`[LinkQu] Validasi inquiry gagal untuk ${tx.partner_reff}. Data tidak cocok (amount=${respAmount}/${tx.amount}, reff=${respPartnerReff}/${tx.partner_reff}).`);
        status = 'PENDING';
      }
    }

    if (!status) {
      this.logger.warn(`[LinkQu] Status inquiry tidak dikenal untuk ${tx.partner_reff}: ${rawStatus}`);
    }

    return { status: status || 'PENDING', clientId: data?.client_id, data };
  }

  private normalizeStatus(status: string): LinkquReconciledStatus | null {
    // Kosakata disamakan dengan status callback agar tidak menambah kontrak baru.
    if (status === 'SUCCESS') return 'SUCCESS';
    if (status === 'FAILED') return 'FAILED';
    if (status === 'EXPIRED') return 'EXPIRED';
    if (status === 'PENDING') return 'PENDING';
    return null;
  }

  private withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('LINKQU_INQUIRY_TIMEOUT')), timeoutMs);
      promise.then(
        (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        (err) => {
          clearTimeout(timer);
          reject(err);
        },
      );
    });
  }
}
