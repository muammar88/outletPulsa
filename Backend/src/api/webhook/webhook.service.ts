import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { PengumumanService } from '../../pengumuman/pengumuman.service';
import { SocketService } from '../../socket/socket.service';
import { DaftarProdukDigiflazzService } from '../../administrator/daftar_produk_digiflazz/daftar_produk_digiflazz.service';
import { TransaksiFinalizerService } from '../transaksi/transaksi-finalizer.service';
import * as crypto from 'crypto';
import { WapisenderService } from '../../providers/wapisender.service';
import { verifyLinkQuCallbackPayload } from './linkqu-verifier';
import { LinkquCallbackProcessorService } from './linkqu-callback-processor.service';
import { PascabayarFinalizerService } from '../../providers/pascabayar/pascabayar-finalizer.service';
import {
  periksaIdentitas,
  resolveConsistentStatus,
  statusFromText,
  strOrNull,
  sumDetailBill,
  toIntOrNull,
} from '../../providers/pascabayar/pascabayar-normalize';
import { PascabayarNormalizedStatus } from '../../providers/pascabayar/pascabayar.types';

interface IakCallbackPayload {
  data: {
    ref_id: string;
    status: number | string;
    sn: string;
    price: number | string;
    message?: string;
  };
}

interface TripayCallbackItem {
  trxid: number | string;
  api_trxid?: string;
  code: string;
  harga: number;
  target: string;
  note: string;
  status: number | string;
  token: string;
}

interface DigiflazzCallbackPayload {
  data: {
    ref_id: string;
    buyer_sku_code: string;
    customer_no: string;
    status: string;
    rc: string;
    sn: string;
    price: number;
    admin?: number | string | null;
    selling_price?: number | string | null;
    sellingPrice?: number | string | null;
    desc?: unknown;
    message: string;
  };
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private static webhookSequence = 0;

  constructor(
    private readonly prisma: PrismaService,
    private readonly pengumumanService: PengumumanService,
    private readonly socketService: SocketService,
    private readonly daftarProdukDigiflazzService: DaftarProdukDigiflazzService,
    private readonly transaksiFinalizer: TransaksiFinalizerService,
    private readonly wapisenderService: WapisenderService,
    private readonly linkquProcessor: LinkquCallbackProcessorService,
    private readonly pascabayarFinalizer: PascabayarFinalizerService,
  ) {}

  async handleIakCallback(
    kodeVerifikasi: string,
    body: IakCallbackPayload,
    ipAddress: string,
  ): Promise<{ error: boolean; error_msg: string }> {
    WebhookService.webhookSequence++;
    console.log(`[Webhook Sequence: ${WebhookService.webhookSequence}] Menerima Webhook IAK. Data:`, JSON.stringify(body));

    const expectedKey = process.env.IAK_CALLBACK_KEY || '';
    if (!expectedKey || !this.safeEqual(kodeVerifikasi, expectedKey)) {
      await this.logWebhook('IAK', 'callback', null, body, 'failed', 'Kode verifikasi tidak valid', ipAddress);
      throw new HttpException({ error: true, error_msg: 'Kode verifikasi tidak valid' }, HttpStatus.UNAUTHORIZED);
    }

    const refId = body?.data?.ref_id;
    const status = body?.data?.status;
    const sn = body?.data?.sn || '';

    if (!refId) {
      await this.logWebhook('IAK', 'callback', null, body, 'failed', 'ref_id kosong', ipAddress);
      throw new HttpException({ error: true, error_msg: 'ref_id tidak ditemukan dalam payload' }, HttpStatus.BAD_REQUEST);
    }

    // Try Prabayar
    const transaction = await this.prisma.transaction.findFirst({
      where: { kode: refId },
      include: { riwayatTransaksi: { include: { member: true } } },
    });

    if (transaction) {
      // B2: Hapus early return yang menyembunyikan konflik status.
      // Alirkan ke finalizer — jika sudah final maka finalizer mencatat konflik ke activityLog.
      const statusCode = Number(status);
      // B2: Ambil harga aktual dari payload IAK (field 'price') jika tersedia
      const iakPrice = body?.data?.price;
      const actualPrice = typeof iakPrice === 'number' && iakPrice > 0 ? iakPrice : undefined;
      if (statusCode === 1 || String(status) === 'SUCCESS') {
        await this.updateSuccessTransaction(sn, transaction, 'IAK', actualPrice);
        await this.logWebhook('IAK', 'callback_prabayar', refId, body, 'success', `Transaksi sukses. SN: ${sn}`, ipAddress);
      } else if (statusCode === 2 || String(status) === 'FAILED') {
        await this.updateFailedTransaction(transaction);
        await this.logWebhook('IAK', 'callback_prabayar', refId, body, 'success', 'Transaksi gagal, saldo dikembalikan', ipAddress);
      } else {
        await this.logWebhook('IAK', 'callback_prabayar', refId, body, 'ignored', `Sudah berstatus ${transaction.status}`, ipAddress);
      }
      return { error: false, error_msg: 'Berhasil' };
    }

    // Try Pascabayar (cocokkan provider agar referensi tidak bentrok antarjenis)
    const transactionPasca = await this.prisma.transactionPascabayar.findFirst({
      where: { trId: refId, OR: [{ provider: 'IAK' }, { provider: null }] },
    });

    if (transactionPasca) {
      if (!this.pascaIdentityMatches(transactionPasca, 'IAK', null, null)) {
        await this.logWebhook('IAK', 'callback_pascabayar', refId, body, 'failed', 'Provider/SKU/pelanggan tidak cocok', ipAddress);
        throw new HttpException({ error: true, error_msg: 'Data transaksi tidak cocok' }, HttpStatus.CONFLICT);
      }
      if (transactionPasca.status === 'sukses' || transactionPasca.status === 'gagal') {
        await this.logWebhook('IAK', 'callback_pascabayar', refId, body, 'ignored', `Sudah berstatus ${transactionPasca.status}`, ipAddress);
        return { error: false, error_msg: 'Berhasil' };
      }
      // Kontrak callback pascabayar IAK belum terverifikasi. Event tetap dicatat,
      // tetapi finalisasi menunggu cek status server-to-server (worker/tombol) agar
      // callback prabayar tidak dianggap bukti pembayaran pascabayar.
      await this.logWebhook(
        'IAK',
        'callback_pascabayar',
        refId,
        body,
        'ignored',
        'Callback pascabayar IAK belum terverifikasi; menunggu cek status server-to-server',
        ipAddress,
      );
      return { error: false, error_msg: 'Berhasil' };
    }

    await this.logWebhook('IAK', 'callback', refId, body, 'ignored', 'Transaksi tidak ditemukan', ipAddress);
    throw new HttpException({ error: true, error_msg: 'Ref Id Tidak Ditemukan' }, HttpStatus.NOT_FOUND);
  }

  async handleTripayCallback(
    callbackSecret: string,
    body: TripayCallbackItem[] | TripayCallbackItem,
    ipAddress: string,
  ): Promise<{ error: boolean; error_msg: string }> {
    WebhookService.webhookSequence++;
    console.log(`[Webhook Sequence: ${WebhookService.webhookSequence}] Menerima Webhook TRIPAY. Data:`, JSON.stringify(body));

    const expectedSecret = process.env.TRIPAY_CALLBACK_SECRET || '';
    if (callbackSecret !== expectedSecret) {
      await this.logWebhook('TRIPAY', 'callback', null, body, 'failed', 'Secret tidak valid', ipAddress);
      throw new HttpException({ error: true, error_msg: 'Kode secret tidak valid' }, HttpStatus.UNAUTHORIZED);
    }

    const item = Array.isArray(body) ? body[0] : body;
    if (!item) {
      await this.logWebhook('TRIPAY', 'callback', null, body, 'failed', 'Body kosong', ipAddress);
      throw new HttpException({ error: true, error_msg: 'Payload tidak valid' }, HttpStatus.BAD_REQUEST);
    }

    const trxId = item.trxid;
    const apiTrxId = item.api_trxid;
    const status = Number(item.status);
    const token = item.token || item.note || '';

    let transaction = await this.prisma.transaction.findFirst({
      where: { trx_id: Number(trxId) },
      include: { riwayatTransaksi: { include: { member: true } } },
    });
    
    if (!transaction && apiTrxId) {
      transaction = await this.prisma.transaction.findFirst({
        where: { kode: apiTrxId },
        include: { riwayatTransaksi: { include: { member: true } } },
      });
    }

    if (transaction) {
      // B2: Hapus early return yang menyembunyikan konflik status.
      // B2: Ambil harga aktual dari payload Tripay — field 'harga' (bukan 'price')
      const tripayHarga = item.harga;
      const actualPrice = typeof tripayHarga === 'number' && tripayHarga > 0 ? tripayHarga : undefined;
      if (status === 1) {
        await this.updateSuccessTransaction(token, transaction, 'TRIPAY', actualPrice);
        await this.logWebhook('TRIPAY', 'callback_prabayar', String(trxId), body, 'success', `Transaksi sukses. Token: ${token}`, ipAddress);
      } else if (status === 2) {
        await this.updateFailedTransaction(transaction);
        await this.logWebhook('TRIPAY', 'callback_prabayar', String(trxId), body, 'success', 'Transaksi gagal, saldo dikembalikan', ipAddress);
      } else {
        await this.logWebhook('TRIPAY', 'callback_prabayar', String(trxId), body, 'ignored', `Sudah berstatus ${transaction.status}`, ipAddress);
      }
      return { error: false, error_msg: 'Berhasil' };
    }

    let transactionPasca = await this.prisma.transactionPascabayar.findFirst({
      where: { trId: String(trxId) },
      include: { riwayatTransaksi: { include: { member: true } } },
    });
    
    if (!transactionPasca && apiTrxId) {
      transactionPasca = await this.prisma.transactionPascabayar.findFirst({
        where: { trId: apiTrxId },
        include: { riwayatTransaksi: { include: { member: true } } },
      });
    }

    if (transactionPasca) {
      if (transactionPasca.status === 'sukses' || transactionPasca.status === 'gagal') {
        await this.logWebhook('TRIPAY', 'callback_pascabayar', String(trxId), body, 'ignored', `Sudah berstatus ${transactionPasca.status}`, ipAddress);
        return { error: false, error_msg: 'Berhasil' };
      }
      if (status === 1) {
        await this.updateSuccessTransactionPascabayar(transactionPasca.id, token);
        await this.logWebhook('TRIPAY', 'callback_pascabayar', String(trxId), body, 'success', `Transaksi sukses. Token: ${token}`, ipAddress);
      } else if (status === 2) {
        await this.updateFailedTransactionPascabayar(transactionPasca.id, 'Gagal berdasarkan callback Tripay');
        await this.logWebhook('TRIPAY', 'callback_pascabayar', String(trxId), body, 'success', 'Transaksi gagal, saldo dikembalikan', ipAddress);
      }
      return { error: false, error_msg: 'Berhasil' };
    }

    await this.logWebhook('TRIPAY', 'callback', String(trxId), body, 'ignored', 'Transaksi tidak ditemukan', ipAddress);
    throw new HttpException({ error: true, error_msg: 'Kode ID tidak ditemukan' }, HttpStatus.NOT_FOUND);
  }

  async handleDigiflazzCallback(
    signature: string,
    rawBody: string,
    body: DigiflazzCallbackPayload,
    ipAddress: string,
  ): Promise<{ error: boolean; error_msg: string }> {
    WebhookService.webhookSequence++;
    console.log(`\n--- [DIGIFLAZZ SERVICE] handleDigiflazzCallback [Sequence: ${WebhookService.webhookSequence}] ---`);
    console.log(`[Webhook Sequence: ${WebhookService.webhookSequence}] Menerima Webhook DIGIFLAZZ. Data:`, JSON.stringify(body));

    const webhookSecret = process.env.DIGIFLAZZ_WEBHOOK_SECRET || '';
    if (!webhookSecret) {
      await this.logWebhook('DIGIFLAZZ', 'callback', null, body, 'failed', 'Secret webhook Digiflazz belum dikonfigurasi', ipAddress);
      throw new HttpException({ error: true, error_msg: 'Webhook belum dikonfigurasi' }, HttpStatus.SERVICE_UNAVAILABLE);
    }
    const expectedSignature = 'sha1=' + crypto.createHmac('sha1', webhookSecret).update(rawBody).digest('hex');
    
    if (!this.safeEqual(signature, expectedSignature)) {
      await this.logWebhook('DIGIFLAZZ', 'callback', null, body, 'failed', 'Signature tidak valid', ipAddress);
      throw new HttpException({ error: true, error_msg: 'Signature tidak valid' }, HttpStatus.UNAUTHORIZED);
    }

    const data = body?.data;
    console.log(`[DIGIFLAZZ SERVICE] Payload data:`, JSON.stringify(data));
    if (!data || !data.ref_id) {
      console.log(`[DIGIFLAZZ SERVICE] Error: Payload tidak valid. data: ${!!data}, ref_id: ${data?.ref_id}`);
      await this.logWebhook('DIGIFLAZZ', 'callback', null, body, 'failed', 'Payload tidak valid', ipAddress);
      throw new HttpException({ error: true, error_msg: 'Payload tidak valid' }, HttpStatus.BAD_REQUEST);
    }

    const refId = data.ref_id;
    const rc = data.rc;
    const sn = data.sn || '';
    
    console.log(`[DIGIFLAZZ SERVICE] refId: ${refId}, rc: ${rc}, sn: ${sn}`);

    console.log(`[DIGIFLAZZ SERVICE] Looking for prabayar transaction with kode: ${refId}`);
    const transaction = await this.prisma.transaction.findFirst({
      where: { kode: refId },
      include: { riwayatTransaksi: { include: { member: true } }, digiflazzTransactions: true },
    });

    if (transaction) {
      console.log(`[DIGIFLAZZ SERVICE] Found prabayar transaction: ${transaction.id}, status: ${transaction.status}`);
      if (transaction.status === 'sukses' || transaction.status === 'gagal') {
        await this.logWebhook('DIGIFLAZZ', 'callback_prabayar', refId, body, 'ignored', `Sudah berstatus ${transaction.status}`, ipAddress);
        return { error: false, error_msg: 'Berhasil' } as any;
      }

      const now = new Date();
      // B2: Ambil harga aktual dari payload Digiflazz (field 'price') jika tersedia
      const digiPrice = data.price;
      const actualPrice = typeof digiPrice === 'number' && digiPrice > 0 ? digiPrice : undefined;
      if (rc === '00') {
        if (transaction.digiflazzTransactions.length > 0) {
          await this.prisma.digiflazzTransaction.updateMany({
            where: { transactionId: transaction.id },
            data: { status: 'sukses', responseTime: now, updatedAt: now },
          });
        }
        await this.updateSuccessTransaction(sn, transaction, 'DIGIFLAZZ', actualPrice);
        await this.logWebhook('DIGIFLAZZ', 'callback_prabayar', refId, body, 'success', `Transaksi sukses. SN: ${sn}`, ipAddress);
      } else if (rc === '03') {
        await this.logWebhook('DIGIFLAZZ', 'callback_prabayar', refId, body, 'ignored', 'Masih pending (rc=03)', ipAddress);
      } else {
        if (transaction.digiflazzTransactions.length > 0) {
          await this.prisma.digiflazzTransaction.updateMany({
            where: { transactionId: transaction.id },
            data: { status: 'gagal', responseTime: now, updatedAt: now },
          });

          // Ban the seller for today and pick a new cheapest seller
          const dfTrx = transaction.digiflazzTransactions[0];
          if (dfTrx.productDigiflazzId && dfTrx.sellerId && dfTrx.buyerSkuCode) {
            await this.prisma.digiflazzSellerProduct.updateMany({
              where: {
                productDigiflazzId: dfTrx.productDigiflazzId,
                sellerId: dfTrx.sellerId,
                buyerSkuKode: dfTrx.buyerSkuCode,
              },
              data: { temp_status: 'banned' },
            });
            await this.daftarProdukDigiflazzService.selectCheapestSellerByProductId(dfTrx.productDigiflazzId);
          }
        }
        await this.updateFailedTransaction(transaction);
        await this.logWebhook('DIGIFLAZZ', 'callback_prabayar', refId, body, 'success', `Transaksi gagal (rc=${rc}), saldo dikembalikan`, ipAddress);
      }
      return { error: false, error_msg: 'Berhasil' };
    }

    console.log(`[DIGIFLAZZ SERVICE] Prabayar transaction not found, looking for pascabayar transaction with trId: ${refId}`);
    const transactionPasca = await this.prisma.transactionPascabayar.findFirst({
      where: { trId: refId, OR: [{ provider: 'DIGIFLAZZ' }, { provider: null }] },
    });

    if (transactionPasca) {
      console.log(`[DIGIFLAZZ SERVICE] Found pascabayar transaction: ${transactionPasca.id}, status: ${transactionPasca.status}`);
      const identityError =
        transactionPasca.provider !== 'DIGIFLAZZ'
          ? `provider=${transactionPasca.provider ?? 'kosong'} != DIGIFLAZZ`
          : periksaIdentitas(
              data as unknown as Record<string, unknown>,
              {
                refId: transactionPasca.trId,
                sku: transactionPasca.providerSku,
                customerNo: transactionPasca.nomorTujuan,
              },
              {
                ref: ['ref_id'],
                sku: ['buyer_sku_code', 'sku'],
                customer: ['customer_no'],
              },
            );
      if (identityError) {
        await this.logWebhook(
          'DIGIFLAZZ',
          'callback_pascabayar',
          refId,
          body,
          'failed',
          `Identitas callback tidak dapat dipastikan: ${identityError}`,
          ipAddress,
        );
        throw new HttpException({ error: true, error_msg: 'Data transaksi tidak cocok' }, HttpStatus.CONFLICT);
      }
      if (transactionPasca.status === 'sukses' || transactionPasca.status === 'gagal') {
        await this.logWebhook('DIGIFLAZZ', 'callback_pascabayar', refId, body, 'ignored', `Sudah berstatus ${transactionPasca.status}`, ipAddress);
        return { error: false, error_msg: 'Berhasil' } as any;
      }

      const statusText = statusFromText(data.status);
      const codeStatus: PascabayarNormalizedStatus | null =
        rc === '00' ? 'sukses' : rc === '03' ? 'pending' : null;
      const normalizedStatus = resolveConsistentStatus(codeStatus, statusText);

      if (normalizedStatus === 'sukses') {
        const pascaBill = this.resolveDigiflazzPascaBill(data);
        const payloadAdmin = (transactionPasca.inquiryPayload as any)?.providerAdminFee ?? null;
        // `price` = biaya yang dipotong dari deposit buyer (harga pokok), bukan tagihan.
        const providerCost = toIntOrNull((data as any).price);
        const billerRef = strOrNull((data as any).noref);
        await this.updateSuccessTransactionPascabayar(
          transactionPasca.id,
          sn,
          pascaBill.billAmount,
          pascaBill.adminFee ?? payloadAdmin,
          providerCost,
          billerRef,
        );
        await this.logWebhook('DIGIFLAZZ', 'callback_pascabayar', refId, body, 'success', `Transaksi sukses. SN: ${sn}`, ipAddress);
      } else if (normalizedStatus === 'pending') {
        await this.logWebhook('DIGIFLAZZ', 'callback_pascabayar', refId, body, 'ignored', 'Masih pending (rc=03)', ipAddress);
      } else if (normalizedStatus === 'gagal') {
        await this.updateFailedTransactionPascabayar(transactionPasca.id, `Gagal berdasarkan callback Digiflazz (rc=${rc})`);
        await this.logWebhook('DIGIFLAZZ', 'callback_pascabayar', refId, body, 'success', `Transaksi gagal (rc=${rc}), saldo dikembalikan`, ipAddress);
      } else {
        await this.logWebhook(
          'DIGIFLAZZ',
          'callback_pascabayar',
          refId,
          body,
          'ignored',
          `Status callback ambigu/bertentangan (rc=${rc}, status=${String(data.status ?? '')}); status tidak diubah`,
          ipAddress,
        );
      }
      return { error: false, error_msg: 'Berhasil' };
    }

    console.log(`[DIGIFLAZZ SERVICE] Transaction not found anywhere for refId: ${refId}`);
    await this.logWebhook('DIGIFLAZZ', 'callback', refId, body, 'ignored', 'Transaksi tidak ditemukan', ipAddress);
    throw new HttpException({ error: true, error_msg: 'Transaksi tidak ditemukan' }, HttpStatus.NOT_FOUND);
  }

  private async updateSuccessTransaction(
    sn: string,
    transactionData: { id: number; kode?: string | null },
    provider = 'WEBHOOK',
    actualPurchasePrice?: number,
  ): Promise<void> {
    // B2: Teruskan harga aktual provider ke finalizer untuk audit laba yang benar
    await this.transaksiFinalizer.finalizeTransaction({
      transactionId: transactionData.id,
      targetStatus: 'sukses',
      sn: sn,
      actualPurchasePrice,
      source: `WEBHOOK_${provider}`,
    });
  }

  private async updateFailedTransaction(
    transactionData: { id: number; kode?: string | null },
    provider = 'WEBHOOK',
  ): Promise<void> {
    await this.transaksiFinalizer.finalizeTransaction({
      transactionId: transactionData.id,
      targetStatus: 'gagal',
      source: `WEBHOOK_${provider}`,
    });
  }

  private async updateSuccessTransactionPascabayar(
    id: number,
    sn: string,
    actualBillAmount?: number | null,
    actualProviderAdminFee?: number | null,
    providerCost?: number | null,
    providerBillRef?: string | null,
  ): Promise<void> {
    await this.pascabayarFinalizer.finalizeSuccess({
      transactionId: id,
      sn,
      actualBillAmount: actualBillAmount ?? null,
      actualProviderAdminFee: actualProviderAdminFee ?? null,
      providerCost: providerCost ?? null,
      providerBillRef: providerBillRef ?? null,
      source: 'WEBHOOK',
    });
  }

  /**
   * Tagihan pelanggan dari callback Digiflazz pasca. `price` adalah potongan
   * deposit buyer (harga pokok), BUKAN tagihan, jadi tidak boleh dipakai sebagai
   * nominal. Utamakan rincian `desc.detail[]` (nilai_tagihan + denda), lalu
   * `selling_price - admin`. Bila tidak ada, kembalikan null agar finalizer
   * memakai nominal snapshot inquiry.
   */
  private resolveDigiflazzPascaBill(data: any): {
    billAmount: number | null;
    adminFee: number | null;
  } {
    const adminFee = toIntOrNull(data?.admin);
    const sellingPrice = toIntOrNull(data?.selling_price ?? data?.sellingPrice);
    const fromDetail = sumDetailBill(data?.desc) ?? sumDetailBill(data);
    const billAmount =
      fromDetail !== null
        ? fromDetail
        : sellingPrice !== null && adminFee !== null
          ? sellingPrice - adminFee
          : null;
    return { billAmount, adminFee };
  }

  private async updateFailedTransactionPascabayar(
    id: number,
    reason?: string | null,
  ): Promise<void> {
    await this.pascabayarFinalizer.finalizeFailure({
      transactionId: id,
      reason: reason ?? null,
      source: 'WEBHOOK',
    });
  }

  /** Perbandingan string tahan waktu untuk kode verifikasi/signature. */
  private safeEqual(a: string, b: string): boolean {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  }

  /**
   * Cocokkan identitas transaksi pascabayar dengan payload provider.
   * Provider null (data lama) tetap diterima agar kompatibel; SKU/nomor
   * dibandingkan hanya bila keduanya tersedia.
   */
  private pascaIdentityMatches(
    trx: { provider: string | null; providerSku: string | null; nomorTujuan: string | null },
    provider: 'IAK' | 'DIGIFLAZZ',
    sku?: string | null,
    customerNo?: string | null,
  ): boolean {
    if (trx.provider && trx.provider !== provider) return false;
    const norm = (v?: string | null) => String(v ?? '').replace(/\s+/g, '').replace(/^0+/, '');
    if (trx.providerSku && sku && norm(trx.providerSku) !== norm(sku)) return false;
    if (trx.nomorTujuan && customerNo && norm(trx.nomorTujuan) !== norm(customerNo)) return false;
    return true;
  }

  private async logWebhook(
    provider: string, event: string, transactionRef: string | null, payload: unknown, status: string, message: string, ipAddress: string,
  ): Promise<void> {
    try {
      await this.prisma.webhookLog.create({
        data: { provider, event, transactionRef, payload: JSON.stringify(payload), status, message, ipAddress },
      });
    } catch (err: unknown) {}
  }

  // --- TRIPAY PAYMENT GATEWAY WEBHOOK ---
  async handleTripayPaymentCallback(body: any, signature: string) {
    const jsonBody = JSON.stringify(body);
    const privateKey = process.env.TRIPAY_PRIVATE_KEY || '';
    const expectedSignature = crypto.createHmac('sha256', privateKey)
      .update(jsonBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      this.logger.warn('Invalid Tripay signature received');
      return { success: false, message: 'Invalid signature' };
    }

    if (body.status === 'PAID') {
      const deposit = await this.prisma.requestDeposit.findUnique({
        where: { tripayReference: body.reference },
        include: { riwayatTransaksi: { include: { member: true } } }
      });

      if (deposit && deposit.status !== 'sukses') {
        await this.prisma.$transaction(async (prisma) => {
          await prisma.requestDeposit.update({
            where: { id: deposit.id },
            data: { status: 'sukses', waktuKirim: new Date() }
          });

          if (deposit.riwayatTransaksi && deposit.riwayatTransaksi.member) {
            const member = deposit.riwayatTransaksi.member;
            const nominal = deposit.nominal || 0;
            const saldoSebelumnya = member.saldo || 0;
            const saldoSetelahnya = saldoSebelumnya + nominal;

            await prisma.member.update({
              where: { id: member.id },
              data: { saldo: saldoSetelahnya }
            });

            await prisma.riwayatSaldo.create({
              data: {
                kode: deposit.kode || `DEP-${Date.now()}`,
                member_id: member.id,
                nominal: nominal,
                saldo_sebelumnya: saldoSebelumnya,
                saldo_setelahnya: saldoSetelahnya,
                status: 'deposit',
                ket: `Deposit via Tripay (${deposit.tripayMethod}) Sukses`
              }
            });
          }
        });
        
        this.logger.log(`Deposit ${body.reference} successfully paid and saldo updated`);
      }
    } else if (body.status === 'EXPIRED' || body.status === 'FAILED') {
      const deposit = await this.prisma.requestDeposit.findUnique({
        where: { tripayReference: body.reference }
      });

      if (deposit && deposit.status === 'proses') {
        await this.prisma.requestDeposit.update({
          where: { id: deposit.id },
          data: { status: body.status === 'EXPIRED' ? 'expired' : 'gagal' }
        });
      }
    }

    return { success: true };
  }

  // --- WAPISENDER WEBHOOK ---
  private static waWebhookSequence = 0;

  private async sendWhatsappMessage(phone: string, message: string) {
    return this.wapisenderService.sendMessage(phone, message);
  }

  async processWhatsappWebhook(payload: any, ipAddress: string = '') {
    WebhookService.waWebhookSequence++;
    this.logger.log(`[Webhook Sequence: ${WebhookService.waWebhookSequence}] Menerima Webhook WAPISender (WhatsApp)`);

    if (!payload || typeof payload !== 'object') {
      return { success: false, message: 'Invalid payload' };
    }

    if (payload.event !== 'message') {
      return { status: 'ignored', message: 'Not a message event' };
    }

    if (payload.from_me === true || payload.from_me === 'true') {
      return { status: 'ignored', message: 'Ignore message from bot itself' };
    }

    if (payload.is_group === true || payload.is_group === 'true') {
      return { status: 'ignored', message: 'Ignore group message' };
    }

    const sender = typeof payload.phone === 'string' ? payload.phone : (payload.phone ? String(payload.phone) : '');
    const message = typeof payload.message === 'string' ? payload.message : '';
    const eventId = payload.event_id ? String(payload.event_id) : '';

    if (!sender || !message) {
      return { success: false, message: 'Missing phone or message in payload' };
    }

    if (eventId) {
      const existingLog = await this.prisma.webhookLog.findFirst({
        where: {
          provider: 'WAPISENDER',
          transactionRef: eventId,
          status: 'success',
        },
      });
      if (existingLog) {
        this.logger.warn(`[WapiSender] Event ${eventId} already processed, ignoring duplicate.`);
        return { status: 'ignored', message: 'Duplicate event already processed' };
      }
    }

    const normalizedSender = this.wapisenderService.normalizePhone(sender);
    if (!normalizedSender || normalizedSender.length < 10) {
      return { success: false, message: 'Invalid sender phone format' };
    }

    const cleanMessage = message.trim();
    const match = cleanMessage.match(/OP-[A-Z0-9]+/i);
    if (!match) {
      await this.wapisenderService.sendMessage(
        normalizedSender,
        'Mohon maaf, format pesan tidak dikenali. Pastikan Anda mengirimkan kode verifikasi yang benar (contoh: OP-1234).',
      );
      return { success: false, message: 'Not a verification message' };
    }
    const verificationCode = match[0].toUpperCase();

    const tempRecord = await this.prisma.temp_registrasi.findFirst({
      where: { verification_code: verificationCode, status: 'unregistrated' },
    });

    if (!tempRecord) {
      await this.wapisenderService.sendMessage(
        normalizedSender,
        'Mohon maaf, kode verifikasi tidak ditemukan atau sudah diverifikasi. Silakan request ulang dari aplikasi.',
      );
      return { success: false, message: 'Verification code not found or already verified' };
    }

    const dbWhatsapp = this.wapisenderService.normalizePhone(tempRecord.whatsapp);
    if (normalizedSender !== dbWhatsapp) {
      await this.wapisenderService.sendMessage(
        normalizedSender,
        'Mohon maaf, nomor WhatsApp pengirim tidak cocok dengan nomor yang didaftarkan di aplikasi.',
      );
      return { success: false, message: 'Sender does not match registered whatsapp' };
    }

    const existingMember = await this.prisma.member.findFirst({
      where: {
        OR: [
          { whatsappnumber: tempRecord.whatsapp },
          { whatsappnumber: normalizedSender },
          { whatsappnumber: dbWhatsapp },
        ],
      },
    });

    if (existingMember) {
      await this.wapisenderService.sendMessage(
        normalizedSender,
        'Pendaftaran gagal. Nomor WhatsApp Anda sudah terdaftar sebelumnya.',
      );
      return { success: false, message: 'Nomor WhatsApp sudah terdaftar.' };
    }

    let registeredMember: { id: number; kode: string; fullname: string } | null = null;

    try {
      registeredMember = await this.prisma.$transaction(async (prisma) => {
        // Atomic claim on temp_registrasi
        const claimResult = await prisma.temp_registrasi.updateMany({
          where: { id: tempRecord.id, status: 'unregistrated' },
          data: { status: 'regitrated' },
        });

        if (claimResult.count === 0) {
          throw new Error('VERIFICATION_CODE_CLAIMED');
        }

        // Generate collision-safe kode member
        let kodeMember = '';
        for (let i = 0; i < 5; i++) {
          const randomSuffix = Math.floor(1000 + Math.random() * 9000);
          const candidate = `OP${randomSuffix}`;
          const exists = await prisma.member.findFirst({ where: { kode: candidate } });
          if (!exists) {
            kodeMember = candidate;
            break;
          }
        }
        if (!kodeMember) {
          kodeMember = `OP${Date.now().toString().slice(-6)}`;
        }

        let referralAgent: any = null;
        if (tempRecord.kode_agen && tempRecord.kode_agen.trim() !== '') {
          referralAgent = await prisma.member.findFirst({
            where: { kode: tempRecord.kode_agen.trim() },
          });
        }

        const newMember = await prisma.member.create({
          data: {
            kode: kodeMember,
            fullname: tempRecord.fullname || 'Member Baru',
            whatsappnumber: tempRecord.whatsapp,
            password: tempRecord.password || '',
            kode_agen: referralAgent ? referralAgent.kode : null,
            status: 'verfied',
          },
        });

        if (tempRecord.device_code) {
          const device = await prisma.deviceConnected.findFirst({
            where: { device_code: tempRecord.device_code },
          });
          if (device) {
            await prisma.deviceConnected.update({
              where: { id: device.id },
              data: { member_id: newMember.id },
            });
          }
        }

        await prisma.webhookLog.create({
          data: {
            provider: 'WAPISENDER',
            event: 'registration_verified',
            transactionRef: eventId || verificationCode,
            payload: JSON.stringify({
              sender: normalizedSender,
              verification_code: verificationCode,
              event_id: eventId,
            }),
            status: 'success',
            message: `Member ${kodeMember} registered successfully`,
            ipAddress: ipAddress || '',
          },
        });

        return {
          id: newMember.id,
          kode: kodeMember,
          fullname: newMember.fullname,
        };
      });
    } catch (err: any) {
      if (err.message === 'VERIFICATION_CODE_CLAIMED') {
        return { status: 'ignored', message: 'Verification code already claimed by another request' };
      }
      this.logger.error(`[WapiSender] Gagal registrasi member via DB transaction:`, err);
      return { success: false, message: 'Gagal memproses registrasi' };
    }

    if (registeredMember) {
      try {
        await this.wapisenderService.sendMessage(
          normalizedSender,
          `Selamat! Registrasi Anda berhasil diproses.\n\nKode Member: *${registeredMember.kode}*\nNama: ${registeredMember.fullname}\n\nSilakan kembali ke aplikasi untuk melanjutkan.`,
        );
      } catch (sendErr: any) {
        this.logger.warn(`[WapiSender] Gagal mengirim pesan selamat registrasi ke ${normalizedSender}: ${sendErr.message}`);
      }

      return {
        message: 'Registrasi berhasil',
        data: {
          success: true,
          kode: registeredMember.kode,
        },
      };
    }

    return { success: false, message: 'Registrasi gagal diproses' };
  }

  async handleLinkQuCallback(payload: any, req?: any) {
    console.log('\n=========================================================');
    console.log('🔗 MENERIMA CALLBACK DARI LINKQU');
    console.log('=========================================================');
    if (req) {
      console.log(`🔗 Client URL Hit : ${req.protocol}://${req.get('host')}${req.originalUrl}`);
      console.log(`🔗 Client IP      : ${req.ip}`);
    }
    console.log('---------------------------------------------------------');
    console.log('🔗 Data Payload   :');
    console.log(JSON.stringify(payload, null, 2));
    console.log('=========================================================\n');

    try {
      const pengaturan = await this.prisma.pengaturanUmum.findFirst();
      const signatureKey = pengaturan?.linkqu_signature_key || process.env.LINKQU_SIGNATURE_KEY;
      const configuredClientId = pengaturan?.linkqu_client_id ?? undefined;

      // 1. Verifikasi Ketat Payload LinkQu (Fail-Closed)
      const verification = verifyLinkQuCallbackPayload(
        payload,
        signatureKey,
        configuredClientId,
        req?.headers,
      );

      if (!verification.isValid || !verification.data) {
        this.logger.warn(`[LinkQu] Rejected callback: ${verification.message}`);
        return { response: '01', message: verification.message };
      }

      // Delegate ke processor
      return await this.linkquProcessor.ingestCallback(
        verification.data,
        payload,
        req?.headers,
        configuredClientId,
      );
    } catch (error: any) {
      this.logger.error('Error handling LinkQu Callback:', error);
      return { response: '01', message: error.message };
    }
  }
}
