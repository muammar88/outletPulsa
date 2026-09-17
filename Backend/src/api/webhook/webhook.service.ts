import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { PengumumanService } from '../../pengumuman/pengumuman.service';
import { SocketService } from '../../socket/socket.service';
import { DaftarProdukDigiflazzService } from '../../administrator/daftar_produk_digiflazz/daftar_produk_digiflazz.service';
import * as crypto from 'crypto';

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
    private readonly daftarProdukDigiflazzService: DaftarProdukDigiflazzService
  ) {}

  async handleIakCallback(
    kodeVerifikasi: string,
    body: IakCallbackPayload,
    ipAddress: string,
  ): Promise<{ error: boolean; error_msg: string }> {
    WebhookService.webhookSequence++;
    console.log(`[Webhook Sequence: ${WebhookService.webhookSequence}] Menerima Webhook IAK. Data:`, JSON.stringify(body));

    const expectedKey = process.env.IAK_CALLBACK_KEY || '';
    if (kodeVerifikasi !== expectedKey) {
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
      if (transaction.status === 'sukses' || transaction.status === 'gagal') {
        await this.logWebhook('IAK', 'callback_prabayar', refId, body, 'ignored', `Sudah berstatus ${transaction.status}`, ipAddress);
        return { error: false, error_msg: 'Berhasil' };
      }
      const statusCode = Number(status);
      if (statusCode === 1 || String(status) === 'SUCCESS') {
        await this.updateSuccessTransaction(sn, transaction);
        await this.logWebhook('IAK', 'callback_prabayar', refId, body, 'success', `Transaksi sukses. SN: ${sn}`, ipAddress);
      } else if (statusCode === 2 || String(status) === 'FAILED') {
        await this.updateFailedTransaction(transaction);
        await this.logWebhook('IAK', 'callback_prabayar', refId, body, 'success', 'Transaksi gagal, saldo dikembalikan', ipAddress);
      }
      return { error: false, error_msg: 'Berhasil' };
    }

    // Try Pascabayar
    const transactionPasca = await this.prisma.transactionPascabayar.findFirst({
      where: { trId: refId },
      include: { riwayatTransaksi: { include: { member: true } } },
    });

    if (transactionPasca) {
      if (transactionPasca.status === 'sukses' || transactionPasca.status === 'gagal') {
        await this.logWebhook('IAK', 'callback_pascabayar', refId, body, 'ignored', `Sudah berstatus ${transactionPasca.status}`, ipAddress);
        return { error: false, error_msg: 'Berhasil' };
      }
      const statusCode = Number(status);
      if (statusCode === 1 || String(status) === 'SUCCESS') {
        await this.updateSuccessTransactionPascabayar(transactionPasca.id, sn, transactionPasca);
        await this.logWebhook('IAK', 'callback_pascabayar', refId, body, 'success', `Transaksi sukses. SN: ${sn}`, ipAddress);
      } else if (statusCode === 2 || String(status) === 'FAILED') {
        await this.updateFailedTransactionPascabayar(transactionPasca.id, transactionPasca);
        await this.logWebhook('IAK', 'callback_pascabayar', refId, body, 'success', 'Transaksi gagal, saldo dikembalikan', ipAddress);
      }
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
      if (transaction.status === 'sukses' || transaction.status === 'gagal') {
        await this.logWebhook('TRIPAY', 'callback_prabayar', String(trxId), body, 'ignored', `Sudah berstatus ${transaction.status}`, ipAddress);
        return { error: false, error_msg: 'Berhasil' };
      }
      if (status === 1) {
        await this.updateSuccessTransaction(token, transaction);
        await this.logWebhook('TRIPAY', 'callback_prabayar', String(trxId), body, 'success', `Transaksi sukses. Token: ${token}`, ipAddress);
      } else if (status === 2) {
        await this.updateFailedTransaction(transaction);
        await this.logWebhook('TRIPAY', 'callback_prabayar', String(trxId), body, 'success', 'Transaksi gagal, saldo dikembalikan', ipAddress);
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
        await this.updateSuccessTransactionPascabayar(transactionPasca.id, token, transactionPasca);
        await this.logWebhook('TRIPAY', 'callback_pascabayar', String(trxId), body, 'success', `Transaksi sukses. Token: ${token}`, ipAddress);
      } else if (status === 2) {
        await this.updateFailedTransactionPascabayar(transactionPasca.id, transactionPasca);
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
    const expectedSignature = 'sha1=' + crypto.createHmac('sha1', webhookSecret).update(rawBody).digest('hex');
    
    console.log(`[DIGIFLAZZ SERVICE] Expected Signature: ${expectedSignature}`);
    console.log(`[DIGIFLAZZ SERVICE] Received Signature: ${signature}`);

    if (signature !== expectedSignature) {
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
      if (rc === '00') {
        if (transaction.digiflazzTransactions.length > 0) {
          await this.prisma.digiflazzTransaction.updateMany({
            where: { transactionId: transaction.id },
            data: { status: 'sukses', responseTime: now, updatedAt: now },
          });
        }
        await this.updateSuccessTransaction(sn, transaction);
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
      where: { trId: refId },
      include: { riwayatTransaksi: { include: { member: true } } },
    });

    if (transactionPasca) {
      console.log(`[DIGIFLAZZ SERVICE] Found pascabayar transaction: ${transactionPasca.id}, status: ${transactionPasca.status}`);
      if (transactionPasca.status === 'sukses' || transactionPasca.status === 'gagal') {
        await this.logWebhook('DIGIFLAZZ', 'callback_pascabayar', refId, body, 'ignored', `Sudah berstatus ${transactionPasca.status}`, ipAddress);
        return { error: false, error_msg: 'Berhasil' } as any;
      }

      if (rc === '00') {
        await this.updateSuccessTransactionPascabayar(transactionPasca.id, sn, transactionPasca);
        await this.logWebhook('DIGIFLAZZ', 'callback_pascabayar', refId, body, 'success', `Transaksi sukses. SN: ${sn}`, ipAddress);
      } else if (rc === '03') {
        await this.logWebhook('DIGIFLAZZ', 'callback_pascabayar', refId, body, 'ignored', 'Masih pending (rc=03)', ipAddress);
      } else {
        await this.updateFailedTransactionPascabayar(transactionPasca.id, transactionPasca);
        await this.logWebhook('DIGIFLAZZ', 'callback_pascabayar', refId, body, 'success', `Transaksi gagal (rc=${rc}), saldo dikembalikan`, ipAddress);
      }
      return { error: false, error_msg: 'Berhasil' };
    }

    console.log(`[DIGIFLAZZ SERVICE] Transaction not found anywhere for refId: ${refId}`);
    await this.logWebhook('DIGIFLAZZ', 'callback', refId, body, 'ignored', 'Transaksi tidak ditemukan', ipAddress);
    throw new HttpException({ error: true, error_msg: 'Transaksi tidak ditemukan' }, HttpStatus.NOT_FOUND);
  }

  private async updateSuccessTransaction(
    sn: string,
    transactionData: { id: number; kode?: string | null; purchase_price: number | null; selling_price: number | null; fee_agen: number | null; riwayatTransaksi: { member: { id: number; kode_agen: string | null } | null } | null },
  ): Promise<void> {
    const feeAgen = transactionData.fee_agen || 0;
    const kodeAgen = transactionData.riwayatTransaksi?.member?.kode_agen || '';
    const laba = (transactionData.selling_price || 0) - (transactionData.purchase_price || 0) - feeAgen;

    await this.prisma.transaction.update({
      where: { id: transactionData.id },
      data: {
        status: 'sukses',
        ket: sn,
        kodeAgen: kodeAgen,
        laba: laba,
        fee_agen: feeAgen,
        serial_number: sn ? String(sn) : undefined,
      },
    });

    const member = transactionData.riwayatTransaksi?.member;
    if (member) {
      this.socketService.emitTransactionUpdated(member.id, {
        transactionId: transactionData.kode || transactionData.id,
        status: 'sukses',
        sn: sn,
        updatedAt: new Date(),
      });
      this.pengumumanService.sendTransactionStatus(
        member.id,
        'Transaksi Berhasil',
        `Pembelian Prabayar dengan kode ${transactionData.kode || transactionData.id} telah sukses. SN: ${sn}`,
        { reference_id: transactionData.kode || String(transactionData.id), status: 'sukses' },
        'prabayar'
      ).catch(e => this.logger.error('Failed to send webhook success notif', e));
    }
  }

  private async updateFailedTransaction(
    transactionData: { id: number; kode?: string | null; selling_price: number | null; fee_agen: number | null; riwayatTransaksi: { member: { id: number; saldo: number | null } | null } | null },
  ): Promise<void> {
    const member = transactionData.riwayatTransaksi?.member;
    if (!member) return;

    const totalRefund = (transactionData.selling_price || 0) + (transactionData.fee_agen || 0);
    await this.prisma.$transaction(async (tx) => {
      await tx.member.update({ where: { id: member.id }, data: { saldo: { increment: totalRefund } } });
      await tx.transaction.update({ where: { id: transactionData.id }, data: { status: 'gagal' } });
    });

    this.socketService.emitTransactionUpdated(member.id, {
      transactionId: transactionData.kode || transactionData.id,
      status: 'gagal',
      updatedAt: new Date(),
    });

    this.pengumumanService.sendTransactionStatus(
      member.id,
      'Transaksi Gagal',
      `Pembelian Prabayar dengan kode ${transactionData.kode || transactionData.id} gagal. Saldo telah dikembalikan.`,
      { reference_id: transactionData.kode || String(transactionData.id), status: 'gagal' },
      'prabayar'
    ).catch(e => this.logger.error('Failed to send webhook failed notif', e));
  }

  private async updateSuccessTransactionPascabayar(
    id: number,
    sn: string,
    transactionData?: { trId?: string | null; riwayatTransaksi: { member: { id: number } | null } | null },
  ): Promise<void> {
    await this.prisma.transactionPascabayar.update({
      where: { id },
      data: {
        status: 'sukses',
        ket: sn,
        serial_number: sn ? String(sn) : undefined,
      },
    });

    const member = transactionData?.riwayatTransaksi?.member;
    if (member) {
      this.socketService.emitTransactionUpdated(member.id, {
        transactionId: transactionData?.trId || id,
        status: 'sukses',
        sn: sn,
        updatedAt: new Date(),
      });
      this.pengumumanService.sendTransactionStatus(
        member.id,
        'Transaksi Pascabayar Berhasil',
        `Pembayaran tagihan dengan ID ${transactionData?.trId || id} sukses. SN: ${sn}`,
        { reference_id: transactionData?.trId || String(id), status: 'sukses' },
        'pascabayar'
      ).catch(e => this.logger.error('Failed to send pasca success notif', e));
    }
  }

  private async updateFailedTransactionPascabayar(
    id: number,
    transactionData: { trId?: string | null; total: number | null; riwayatTransaksi: { member: { id: number; saldo: number | null } | null } | null },
  ): Promise<void> {
    const member = transactionData.riwayatTransaksi?.member;
    if (!member) return;

    const totalRefund = transactionData.total || 0;
    await this.prisma.$transaction(async (tx) => {
      await tx.member.update({ where: { id: member.id }, data: { saldo: { increment: totalRefund } } });
      await tx.transactionPascabayar.update({ where: { id }, data: { status: 'gagal' } });
    });

    this.socketService.emitTransactionUpdated(member.id, {
      transactionId: transactionData.trId || id,
      status: 'gagal',
      updatedAt: new Date(),
    });

    this.pengumumanService.sendTransactionStatus(
      member.id,
      'Transaksi Pascabayar Gagal',
      `Pembayaran tagihan dengan ID ${transactionData.trId || id} gagal. Saldo dikembalikan.`,
      { reference_id: transactionData.trId || String(id), status: 'gagal' },
      'pascabayar'
    ).catch(e => this.logger.error('Failed to send pasca failed notif', e));
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

  private async sendWhatsappMessage(phone: string, message: string, webhookPayload?: any) {
    const url = process.env.WAPISENDER_URL || 'https://wapisender.id/api/message/send';
    const apiKey = process.env.WAPISENDER_API_KEY;
    const deviceKey = webhookPayload?.device_id || process.env.WAPISENDER_DEVICE_KEY;

    if (!apiKey || !deviceKey) {
      this.logger.warn(`[WAPISENDER] Kredensial tidak lengkap di .env (WAPISENDER_API_KEY, WAPISENDER_DEVICE_KEY). Abaikan pesan ke ${phone}`);
      return;
    }
    
    try {
      const payloadObj: any = {
        api_key: apiKey,
        device_key: deviceKey,
        message: message,
        is_priority: true
      };

      if (webhookPayload?.is_group) {
          payloadObj.group = webhookPayload?.chat_jid;
      } else {
          payloadObj.to = phone;
      }

      if (webhookPayload?.message_id) {
          payloadObj.quoted_id = webhookPayload.message_id;
          payloadObj.quoted_participant = webhookPayload.sender_jid;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadObj)
      });
      
      const responseText = await response.text();
      
      if (!response.ok) {
         this.logger.error(`[WAPISENDER] Gagal mengirim pesan ke ${phone}. HTTP Status: ${response.status}. Response: ${responseText}`);
      } else {
         this.logger.log(`[WAPISENDER] Berhasil mengirim pesan balasan ke ${phone}. Response: ${responseText}`);
      }
    } catch (error: any) {
      this.logger.error(`[WAPISENDER] Error mengirim pesan ke ${phone}: ${error.message}`);
    }
  }

  async processWhatsappWebhook(payload: any) {
    WebhookService.waWebhookSequence++;
    this.logger.log(`[Webhook Sequence: ${WebhookService.waWebhookSequence}] Menerima Webhook WAPISender (WhatsApp). Data: ${JSON.stringify(payload)}`);

    if (!payload || typeof payload !== 'object') {
      return { success: false, message: 'Invalid payload' };
    }

    if (payload.event !== 'message') {
      return { status: 'ignored', message: 'Not a message event' };
    }

    const sender = payload.phone;
    const message = payload.message;
    const eventId = payload.event_id;

    if (!sender || !message) {
      return { success: false, message: 'Missing phone or message in payload' };
    }

    this.logger.log(`[Webhook] Received message event ${eventId} from ${sender}`);

    let normalizedSender = sender.replace(/\D/g, '');
    if (normalizedSender.startsWith('0')) {
        normalizedSender = '62' + normalizedSender.substring(1);
    } else if (normalizedSender.startsWith('8')) {
        normalizedSender = '62' + normalizedSender;
    }

    const cleanMessage = message.trim();
    const match = cleanMessage.match(/OP-[A-Z0-9]+/i);
    if (!match) {
       await this.sendWhatsappMessage(normalizedSender, 'Mohon maaf, format pesan tidak dikenali. Pastikan Anda mengirimkan kode verifikasi yang benar (contoh: OP-1234).', payload);
       return { success: false, message: 'Not a verification message' };
    }
    const verificationCode = match[0].toUpperCase();

    return await this.prisma.$transaction(async (prisma) => {
      const otpRecord = await prisma.otpRegister.findFirst({
          where: { verification_code: verificationCode, status: 'active' }
      });

      if (!otpRecord) {
          await this.sendWhatsappMessage(normalizedSender, 'Mohon maaf, kode verifikasi tidak ditemukan atau sudah kedaluwarsa. Silakan request ulang dari aplikasi.', payload);
          return { success: false, message: 'Verification code not found or already verified' };
      }

      let dbWhatsapp = otpRecord.whatsapp.replace(/\D/g, '');
      if (dbWhatsapp.startsWith('0')) {
          dbWhatsapp = '62' + dbWhatsapp.substring(1);
      } else if (dbWhatsapp.startsWith('8')) {
          dbWhatsapp = '62' + dbWhatsapp;
      }

      if (normalizedSender !== dbWhatsapp) {
          await this.sendWhatsappMessage(normalizedSender, 'Mohon maaf, nomor WhatsApp pengirim tidak cocok dengan nomor yang didaftarkan di aplikasi.', payload);
          return { success: false, message: 'Sender does not match registered whatsapp' };
      }

      const existingMember = await prisma.member.findUnique({
        where: { whatsappnumber: otpRecord.whatsapp },
      });

      if (existingMember) {
        await this.sendWhatsappMessage(normalizedSender, 'Pendaftaran gagal. Nomor WhatsApp Anda sudah terdaftar sebelumnya.', payload);
        return { success: false, message: 'Nomor WhatsApp sudah terdaftar.' };
      }

      let referralAgent: any = null;
      if (otpRecord.kode_agen && otpRecord.kode_agen.trim() !== '') {
        referralAgent = await prisma.member.findFirst({
          where: { kode: otpRecord.kode_agen.trim() },
        });
      }

      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const kodeMember = `OP${randomSuffix}`;

      const newMember = await prisma.member.create({
        data: {
          kode: kodeMember,
          fullname: otpRecord.fullname || 'Member Baru',
          whatsappnumber: otpRecord.whatsapp,
          password: otpRecord.password || '',
          kode_agen: referralAgent ? referralAgent.kode : null,
          status: 'verfied',
        },
      });

      await prisma.otpRegister.update({
        where: { id: otpRecord.id },
        data: { status: 'nonactive' },
      });

      await this.sendWhatsappMessage(normalizedSender, `Selamat! Registrasi Anda berhasil diproses.\n\nKode Member: *${kodeMember}*\nNama: ${newMember.fullname}\n\nSilakan kembali ke aplikasi untuk melanjutkan.`, payload);

      const device = await prisma.deviceConnected.findFirst({
        where: { device_code: otpRecord.device_code },
      });

      if (device) {
        await prisma.deviceConnected.update({
          where: { id: device.id },
          data: { member_id: newMember.id },
        });
      }

      return { message: 'Registrasi berhasil', data: { success: true } };
    });
  }
}
