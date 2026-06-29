import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { PengumumanService } from '../../pengumuman/pengumuman.service';
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

  constructor(
    private readonly prisma: PrismaService,
    private readonly pengumumanService: PengumumanService
  ) {}

  async handleIakCallback(
    kodeVerifikasi: string,
    body: IakCallbackPayload,
    ipAddress: string,
  ): Promise<{ error: boolean; error_msg: string }> {
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
    const webhookSecret = process.env.DIGIFLAZZ_WEBHOOK_SECRET || '';
    const expectedSignature = 'sha1=' + crypto.createHmac('sha1', webhookSecret).update(rawBody).digest('hex');

    if (signature !== expectedSignature) {
      await this.logWebhook('DIGIFLAZZ', 'callback', null, body, 'failed', 'Signature tidak valid', ipAddress);
      throw new HttpException({ error: true, error_msg: 'Signature tidak valid' }, HttpStatus.UNAUTHORIZED);
    }

    const data = body?.data;
    if (!data || !data.ref_id) {
      await this.logWebhook('DIGIFLAZZ', 'callback', null, body, 'failed', 'Payload tidak valid', ipAddress);
      throw new HttpException({ error: true, error_msg: 'Payload tidak valid' }, HttpStatus.BAD_REQUEST);
    }

    const refId = data.ref_id;
    const rc = data.rc;
    const sn = data.sn || '';

    const transaction = await this.prisma.transaction.findFirst({
      where: { kode: refId },
      include: { riwayatTransaksi: { include: { member: true } }, digiflazzTransactions: true },
    });

    if (transaction) {
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
        }
        await this.updateFailedTransaction(transaction);
        await this.logWebhook('DIGIFLAZZ', 'callback_prabayar', refId, body, 'success', `Transaksi gagal (rc=${rc}), saldo dikembalikan`, ipAddress);
      }
      return { error: false, error_msg: 'Berhasil' };
    }

    const transactionPasca = await this.prisma.transactionPascabayar.findFirst({
      where: { trId: refId },
      include: { riwayatTransaksi: { include: { member: true } } },
    });

    if (transactionPasca) {
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
      this.pengumumanService.sendTransactionStatus(
        member.id,
        'Transaksi Berhasil',
        `Pembelian Prabayar dengan kode ${transactionData.kode || transactionData.id} telah sukses. SN: ${sn}`,
        { transactionKode: transactionData.kode, status: 'sukses' }
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

    this.pengumumanService.sendTransactionStatus(
      member.id,
      'Transaksi Gagal',
      `Pembelian Prabayar dengan kode ${transactionData.kode || transactionData.id} gagal. Saldo telah dikembalikan.`,
      { transactionKode: transactionData.kode, status: 'gagal' }
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
      this.pengumumanService.sendTransactionStatus(
        member.id,
        'Transaksi Pascabayar Berhasil',
        `Pembayaran tagihan dengan ID ${transactionData?.trId || id} sukses. SN: ${sn}`,
        { transactionKode: transactionData?.trId, status: 'sukses' }
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

    this.pengumumanService.sendTransactionStatus(
      member.id,
      'Transaksi Pascabayar Gagal',
      `Pembayaran tagihan dengan ID ${transactionData.trId || id} gagal. Saldo dikembalikan.`,
      { transactionKode: transactionData.trId, status: 'gagal' }
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
}
