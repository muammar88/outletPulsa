import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { DepositSaldoDto } from './dto/deposit-saldo.dto';
import { DepositLinkquDto } from './dto/deposit-linkqu.dto';
import { PengumumanService } from '../../pengumuman/pengumuman.service';
import * as crypto from 'crypto';

@Injectable()
export class DepositService {
  private readonly logger = new Logger(DepositService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pengumumanService: PengumumanService
  ) {}

  async getDepositInfo(memberId: number) {
    try {
      // Dapatkan tiket deposit yang masih proses
      const pendingTickets = await this.prisma.requestDeposit.findMany({
        where: {
          riwayatTransaksi: {
            memberId: memberId,
          },
          status: 'proses',
        },
        select: {
          id: true,
          kode: true,
          nominal: true,
          nominalTambahan: true,
          waktuRequest: true,
        },
      });

      const list_tiket = pendingTickets.map((t) => ({
        id: t.id.toString(),
        kode: t.kode || '-',
        total: ((t.nominal || 0) + (t.nominalTambahan || 0)).toString(),
        waktuRequest: t.waktuRequest?.toISOString() || '',
      }));

      // Dapatkan bank transfer outlet
      const banks = await this.prisma.bankTransferOutlet.findMany({
        include: { bank: true },
      });

      const list_select_bank = banks.map(
        (b) => `${b.id}:${b.bank?.nama || 'Bank'}`
      );

      const list_bank = {};
      banks.forEach((b) => {
        list_bank[b.id] = {
          nama: b.bank?.nama || '',
          accountName: b.accountName || '',
          accountNumber: b.accountNumber || '',
          image: b.bank?.image || '',
        };
      });

      return {
        error: false,
        error_msg: '',
        list_tiket,
        list_bank,
        list_select_bank,
        pesan:
          'Silakan transfer sesuai dengan nominal tiket deposit (termasuk 3 digit kode unik) agar saldo otomatis bertambah.',
      };
    } catch (error) {
      return {
        error: true,
        error_msg: 'Gagal mengambil informasi deposit',
        data: {},
      };
    }
  }

  async getDepositInfoKonfirmasi(memberId: number) {
    try {
      const deposit = await this.prisma.requestDeposit.findFirst({
        where: {
          riwayatTransaksi: {
            memberId: memberId,
          },
          status: 'proses',
        },
        orderBy: {
          id: 'desc',
        },
        include: {
          bankTransferOutlet: {
            include: {
              bank: true,
            },
          },
        },
      });

      if (!deposit) {
        return {
          error: false,
          message: 'Success',
          data: {},
        };
      }

      const totalNominal = (deposit.nominal || 0) + (deposit.nominalTambahan || 0);

      return {
        error: false,
        message: 'Success',
        data: {
          list: {
            kode: deposit.kode || '-',
            nominal: totalNominal.toString(),
            bank_tujuan_transfer: deposit.bankTransferOutlet?.bank?.nama || '-',
            nomor_rekening_akun: deposit.bankTransferOutlet?.accountNumber || '-',
            nama_akun: deposit.bankTransferOutlet?.accountName || '-',
            status_deposit: deposit.status || '-',
            status_kirim: deposit.statusKirim || '-',
            alasan_penolakan: deposit.alasanPenolakan || '-',
            waktu_kirim: deposit.waktuKirim ? deposit.waktuKirim.toISOString() : '-',
          },
        },
      };
    } catch (error) {
      return {
        error: true,
        error_msg: 'Gagal mengambil informasi konfirmasi deposit',
        data: {},
      };
    }
  }

  // --- Helper Functions untuk Generate Code ---
  private randomString(length: number, chars: string): string {
    let result = '';
    for (let i = length; i > 0; --i) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }

  private async newCodeBiaya(): Promise<number> {
    let rand = 0;
    let condition = true;

    while (condition) {
      rand = parseInt(this.randomString(3, '123456789'), 10);
      const check = await this.prisma.requestDeposit.findFirst({
        where: { nominalTambahan: rand },
      });
      if (!check) condition = false;
    }
    return rand;
  }

  private async newCodeTransDeposit(): Promise<string> {
    let rand = '';
    let condition = true;

    while (condition) {
      rand = this.randomString(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
      const check = await this.prisma.requestDeposit.findFirst({
        where: { kode: rand },
      });
      if (!check) condition = false;
    }
    return rand;
  }

  // --- Main Logic depositSaldo ---
  async depositSaldo(memberId: number, body: DepositSaldoDto) {
    if (!memberId) {
      return {
        error: true,
        error_msg: 'Id Member Tidak Ditemukan.',
      };
    }

    try {
      // 1. Cek apakah ada deposit proses
      // const total = await this.prisma.requestDeposit.count({
      //   where: {
      //     riwayatTransaksi: {
      //       memberId: memberId,
      //     },
      //     status: 'proses',
      //   },
      // });

      // if (total > 0) {
      //   return {
      //     error: true,
      //     error_msg: 'Masih terdapat request yang belum diproses.',
      //   };
      // }

      // 2. Bersihkan nominal jika berupa string (contoh: "Rp 1.000.000")
      let rawNominal = typeof body.nominal === 'string' ? body.nominal.replace(/[^0-9]/g, '') : body.nominal.toString();
      const nominal = parseInt(rawNominal, 10);
      const bankId = parseInt(body.bank_tujuan_transfer.toString(), 10);

      // 3. Generate random code
      const randCode = await this.newCodeBiaya();
      const kodeTrans = await this.newCodeTransDeposit();
      const myDate = new Date();

      // 4. Transaction database (Prisma)
      await this.prisma.$transaction(async (tx) => {
        const iRiwayat = await tx.riwayatTransaksi.create({
          data: {
            memberId: memberId,
            tipeTransaksi: 'deposit',
            createdAt: myDate,
            updatedAt: myDate,
          },
        });

        await tx.requestDeposit.create({
          data: {
            kode: kodeTrans,
            riwayatTransaksiId: iRiwayat.id,
            nominal: nominal,
            nominalTambahan: randCode,
            status: 'proses',
            bankTransferId: bankId,
            waktuRequest: myDate,
            statusKirim: 'belum_kirim',
            createdAt: myDate,
            updatedAt: myDate,
          },
        });
      });

      // Fire pengumuman
      this.pengumumanService.sendPengumuman({
          title: 'Tiket Deposit Berhasil',
          body: `Tiket deposit Rp ${nominal} berhasil dibuat. Silakan transfer sesuai instruksi.`,
          pengumumanType: 'deposit',
          targetType: 'User',
          targetId: memberId.toString(),
          payload: { reference_id: kodeTrans, nominal }
      }).catch(e => console.error('Failed to send deposit pengumuman', e));

      return {
        error: false,
        error_msg: 'Tiket Deposit Saldo Berhasil Digenerated',
      };
    } catch (error) {
      return {
        error: true,
        error_msg: 'Proses ambil tiket deposit saldo gagal dilakukan.',
      };
    }
  }

  // --- LinkQu Integration ---
  
  async getLinkquPaymentMethods() {
    try {
      const pengaturan = await this.prisma.pengaturanUmum.findFirst();
      if (!pengaturan || !pengaturan.linkqu_is_active) {
        return {
          error: true,
          error_msg: 'Layanan LinkQu sedang tidak aktif',
        };
      }

      const activeMethods: any[] = [];
      if (pengaturan.linkqu_payment_va) {
        const banks = await this.prisma.bankLinkqu.findMany({
          where: { status: true },
          orderBy: { urutan: 'asc' }
        });
        activeMethods.push({ code: 'VA', name: 'Virtual Account', items: banks });
      }

      if (pengaturan.linkqu_payment_ewallet) {
        const emoneys = await this.prisma.emoneyLinkqu.findMany({
          where: { status: true }
        });
        activeMethods.push({ code: 'EWALLET', name: 'E-Wallet', items: emoneys });
      }

      if (pengaturan.linkqu_payment_qris) {
        activeMethods.push({ code: 'QRIS', name: 'QRIS', items: [] });
      }

      return {
        error: false,
        data: activeMethods
      };
    } catch (error) {
      return {
        error: true,
        error_msg: 'Gagal memuat metode pembayaran LinkQu',
      };
    }
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs = 15000): Promise<T> {
    let timer: NodeJS.Timeout;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('LINKQU_TIMEOUT')), timeoutMs);
    });
    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      clearTimeout(timer!);
    }
  }

  async processLinkquDeposit(memberId: number, body: DepositLinkquDto) {
    if (!memberId) {
      return { error: true, error_msg: 'Id Member Tidak Ditemukan.' };
    }

    try {
      // 1. Strict nominal validation: positive integer, min 10.000, max 10.000.000
      const rawNominalStr = String(body.nominal).trim();
      if (!/^\d+$/.test(rawNominalStr)) {
        return { error: true, error_msg: 'Nominal deposit tidak valid. Harus berupa bilangan bulat positif.' };
      }
      const nominal = parseInt(rawNominalStr, 10);
      if (nominal < 10000 || nominal > 10000000) {
        return { error: true, error_msg: 'Nominal deposit minimal Rp10.000 dan maksimal Rp10.000.000' };
      }

      // 2. Gateway activation check
      const pengaturan = await this.prisma.pengaturanUmum.findFirst();
      if (!pengaturan || !pengaturan.linkqu_is_active) {
        return { error: true, error_msg: 'Layanan LinkQu sedang tidak aktif' };
      }

      const paymentMethod = (body.payment_method || '').toUpperCase();
      const bankCode = body.bank_code;

      if (paymentMethod === 'VA') {
        if (!pengaturan.linkqu_payment_va) {
          return { error: true, error_msg: 'Metode pembayaran Virtual Account sedang dinonaktifkan' };
        }
        if (!bankCode) {
          return { error: true, error_msg: 'Kode bank wajib dipilih untuk pembayaran Virtual Account' };
        }
        const bank = await this.prisma.bankLinkqu.findFirst({ where: { kode: bankCode, status: true } });
        if (!bank) {
          return { error: true, error_msg: 'Bank yang dipilih tidak aktif atau tidak ditemukan' };
        }
      } else if (paymentMethod === 'QRIS') {
        if (!pengaturan.linkqu_payment_qris) {
          return { error: true, error_msg: 'Metode pembayaran QRIS sedang dinonaktifkan' };
        }
      } else if (paymentMethod === 'EWALLET') {
        if (!pengaturan.linkqu_payment_ewallet) {
          return { error: true, error_msg: 'Metode pembayaran E-Wallet sedang dinonaktifkan' };
        }
        if (!bankCode) {
          return { error: true, error_msg: 'E-Wallet wajib dipilih' };
        }
        const emoney = await this.prisma.emoneyLinkqu.findFirst({ where: { kode: bankCode, status: true } });
        if (!emoney) {
          return { error: true, error_msg: 'E-Wallet yang dipilih tidak aktif atau tidak ditemukan' };
        }
      } else {
        return { error: true, error_msg: 'Metode pembayaran tidak valid' };
      }

      // 3. Member & Contact validation
      const member = await this.prisma.member.findUnique({ where: { id: memberId } });
      if (!member) {
        return { error: true, error_msg: 'Member tidak ditemukan' };
      }
      const phone = (member.whatsappnumber || '').trim();
      if (!phone || phone.length < 10) {
        return { error: true, error_msg: 'Nomor WhatsApp akun Anda tidak valid untuk pembuatan pembayaran' };
      }

      // 4. Configuration credentials check
      const clientId = (pengaturan.linkqu_client_id || '').trim();
      const clientSecret = (pengaturan.linkqu_client_secret || '').trim();
      const signatureKey = (pengaturan.linkqu_signature_key || '').trim();
      const username = (pengaturan.linkqu_merchant_code || 'LINKQU').trim();
      const pin = (pengaturan.linkqu_pin || '').trim();
      if (!clientId || !clientSecret || !signatureKey) {
        return { error: true, error_msg: 'Konfigurasi kredensial LinkQu belum lengkap di sistem' };
      }

      // 5. Idempotency Key check
      const partnerReff = body.idempotency_key
        ? `DP-${memberId}-${body.idempotency_key.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 25)}`
        : `DP-${memberId}-${Date.now()}`;

      const existingTx = await this.prisma.paymentGatewayTransaction.findUnique({
        where: { partner_reff: partnerReff },
        include: { requestDeposit: true },
      });
      if (existingTx) {
        let metadataObj: any = {};
        try {
          metadataObj = JSON.parse(existingTx.metadata || '{}');
        } catch {}
        return {
          error: false,
          data: {
            transaction_id: existingTx.uuid,
            payment_method: existingTx.payment_method,
            bank_code: existingTx.bank_code,
            bank_name: existingTx.bank_name,
            virtual_account: existingTx.virtual_account,
            amount: Number(existingTx.amount),
            fee_admin: Number(existingTx.fee_admin),
            total_amount: Number(existingTx.total_amount),
            expired_at: existingTx.expired_at,
            status: existingTx.status,
            partner_reff: existingTx.partner_reff,
            qris_text: metadataObj.qris_text,
            imageqris: metadataObj.imageqris,
            checkout_url: metadataObj.checkout_url,
          },
        };
      }

      // 6. Pre-commit local records in DB in PENDING status BEFORE calling provider API
      const myDate = new Date();
      const nowEpoch = myDate.getTime();
      const expiredAtDB = new Date(nowEpoch + (2 * 60 * 60 * 1000));
      const kodeTrans = await this.newCodeTransDeposit();

      let createdTx: any = null;
      let reqDeposit: any = null;

      await this.prisma.$transaction(async (tx) => {
        const iRiwayat = await tx.riwayatTransaksi.create({
          data: {
            memberId: memberId,
            tipeTransaksi: 'deposit',
            createdAt: myDate,
            updatedAt: myDate,
          },
        });

        reqDeposit = await tx.requestDeposit.create({
          data: {
            kode: kodeTrans,
            riwayatTransaksiId: iRiwayat.id,
            nominal: nominal,
            nominalTambahan: 0,
            status: 'proses',
            waktuRequest: myDate,
            statusKirim: 'belum_kirim',
            createdAt: myDate,
            updatedAt: myDate,
          },
        });

        createdTx = await tx.paymentGatewayTransaction.create({
          data: {
            reference_id: memberId.toString(),
            reference_type: 'DEPOSIT',
            partner_reff: partnerReff,
            payment_method: paymentMethod,
            bank_code: bankCode,
            bank_name: bankCode === '013' ? 'Permata' : (bankCode || paymentMethod),
            virtual_account: null,
            amount: nominal,
            fee_admin: 0,
            total_amount: nominal,
            expired_at: expiredAtDB,
            status: 'PENDING',
            provider: 'LINKQU',
            requestDepositId: reqDeposit.id,
            metadata: JSON.stringify({ state: 'CREATED' }),
          },
        });
      });

      // 7. Call Provider API
      const isSandbox = pengaturan.linkqu_is_sandbox;
      let baseUrl = isSandbox ? pengaturan.linkqu_base_url_dev : pengaturan.linkqu_base_url_prod;
      if (!baseUrl) {
        baseUrl = isSandbox ? 'https://gateway-dev.linkqu.id' : 'https://api.linkqu.id';
      }
      baseUrl = baseUrl.replace(/\/+$/, '').replace(/\/linkqu-partner$/, '');
      const baseUrlWebhook = (process.env.LINKQU_WEBHOOK_URL || 'https://outletpulsa.com/api/webhook/linkqu').replace(/\/+$/, '');

      const expiryUTC7 = new Date(nowEpoch + (9 * 60 * 60 * 1000));
      const expired = expiryUTC7.getUTCFullYear().toString() +
        (expiryUTC7.getUTCMonth() + 1).toString().padStart(2, '0') +
        expiryUTC7.getUTCDate().toString().padStart(2, '0') +
        expiryUTC7.getUTCHours().toString().padStart(2, '0') +
        expiryUTC7.getUTCMinutes().toString().padStart(2, '0') +
        expiryUTC7.getUTCSeconds().toString().padStart(2, '0');

      let apiPath = '';
      let signPath = '';
      let payload: any = {
        amount: nominal,
        partner_reff: partnerReff,
        customer_id: memberId.toString(),
        customer_name: member.fullname || 'Member',
        expired: expired,
        username: username,
        pin: pin,
        customer_phone: phone,
        customer_email: `${phone}@outletpulsa.com`,
      };

      if (paymentMethod === 'VA') {
        if (bankCode === '013') {
          apiPath = '/linkqu-partner/transaction/create/vapermata';
          signPath = '/transaction/create/vapermata';
        } else {
          apiPath = '/linkqu-partner/transaction/create/va';
          signPath = '/transaction/create/va';
        }
        payload.bank_code = bankCode;
        payload.url_callback = `${baseUrlWebhook}/va`;
        if (bankCode !== '013') {
          payload.remark = 'Deposit Outlet Pulsa';
        }
      } else if (paymentMethod === 'QRIS') {
        apiPath = '/linkqu-partner/transaction/create/qris';
        signPath = '/transaction/create/qris';
        payload.url_callback = `${baseUrlWebhook}/qris`;
      } else if (paymentMethod === 'EWALLET') {
        let retailCode = bankCode;
        if (bankCode === 'OVO') retailCode = 'PAYOVO';
        else if (bankCode === 'DANA') retailCode = 'PAYDANA';
        else if (bankCode === 'LINKAJA') retailCode = 'PAYLINKAJA';
        else if (bankCode === 'GOPAY') retailCode = 'PAYGOPAY';
        else if (bankCode === 'SHOPEEPAY' || bankCode === 'SHOPEE') retailCode = 'PAYSHOPEE';

        if (retailCode === 'PAYOVO') {
          apiPath = '/linkqu-partner/transaction/create/ovopush';
          signPath = '/transaction/create/ovopush';
        } else {
          apiPath = '/linkqu-partner/transaction/create/paymentewallet';
          signPath = '/transaction/create/paymentewallet';
        }
        payload.retail_code = retailCode;
        payload.ewallet_phone = phone;
        payload.bill_title = 'Deposit Outlet Pulsa';
        payload.url_callback = `${baseUrlWebhook}/ewallet`;
      }

      let rawString = '';
      if (paymentMethod === 'VA') {
        rawString = String(payload.amount || '') + String(payload.expired || '') + String(payload.bank_code || '') + String(payload.partner_reff || '') + String(payload.customer_id || '') + String(payload.customer_name || '') + String(payload.customer_email || '') + String(clientId);
      } else if (paymentMethod === 'QRIS') {
        rawString = String(payload.amount || '') + String(payload.expired || '') + String(payload.partner_reff || '') + String(payload.customer_id || '') + String(payload.customer_name || '') + String(payload.customer_email || '') + String(clientId);
      } else if (paymentMethod === 'EWALLET') {
        rawString = String(payload.amount || '') + String(payload.expired || '') + String(payload.retail_code || '') + String(payload.partner_reff || '') + String(payload.customer_id || '') + String(payload.customer_name || '') + String(payload.customer_email || '') + String(payload.ewallet_phone || '') + String(clientId);
      }

      const firstvalue = signPath + 'POST';
      const secondvalue = rawString.replace(/[^0-9a-zA-Z]/g, '').toLowerCase();
      const buildkey = firstvalue + secondvalue;
      const signature = crypto.createHmac('sha256', signatureKey).update(buildkey).digest('hex');
      payload.signature = signature;

      let responseData: any = null;
      try {
        const response = await this.withTimeout(
          fetch(`${baseUrl}${apiPath}`, {
            method: 'POST',
            headers: {
              'client-id': clientId,
              'client-secret': clientSecret,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          }),
          15000,
        );

        const responseText = await response.text();
        responseData = JSON.parse(responseText);
      } catch (err: any) {
        this.logger.error(`LinkQu create call error/timeout for ${partnerReff}:`, err);
        // Timeout or network error: keep PENDING for recovery/webhook
        return {
          error: false,
          error_msg: 'Permintaan pembayaran sedang diproses oleh penyedia LinkQu',
          data: {
            transaction_id: createdTx?.uuid,
            payment_method: paymentMethod,
            bank_code: bankCode,
            amount: nominal,
            total_amount: nominal,
            status: 'PENDING',
            partner_reff: partnerReff,
          },
        };
      }

      if (!responseData || responseData.response_code !== '00' || responseData.status !== 'SUCCESS') {
        const errMsg = responseData?.response_desc || responseData?.rd || responseData?.message || 'Gagal membuat pembayaran LinkQu';
        await this.prisma.paymentGatewayTransaction.update({
          where: { id: createdTx.id },
          data: { status: 'FAILED', metadata: JSON.stringify(responseData || {}) },
        });
        await this.prisma.requestDeposit.update({
          where: { id: reqDeposit.id },
          data: { status: 'gagal', alasanPenolakan: errMsg },
        });
        return { error: true, error_msg: errMsg };
      }

      // Success response: normalize fee and amounts
      const rawFee = responseData.feeadmin ?? responseData.fee ?? 0;
      const feeAdmin = Number(rawFee) || 0;
      const totalAmount = nominal + feeAdmin;

      const vaNumber = paymentMethod === 'VA' ? (responseData.virtual_account || responseData.va_number || null) : null;
      const qrisText = paymentMethod === 'QRIS' ? (responseData.qris_text || responseData.qr_content || null) : null;
      const checkoutUrl = paymentMethod === 'EWALLET' ? (responseData.checkout_url || responseData.url_checkout || null) : null;

      const updatedMetadata = JSON.stringify({
        ...responseData,
        qris_text: qrisText,
        imageqris: responseData.imageqris,
        checkout_url: checkoutUrl,
      });

      const updatedTx = await this.prisma.paymentGatewayTransaction.update({
        where: { id: createdTx.id },
        data: {
          virtual_account: vaNumber,
          fee_admin: feeAdmin,
          total_amount: totalAmount,
          bank_name: bankCode === '013' ? 'Permata' : (responseData.bank_name || bankCode || paymentMethod),
          metadata: updatedMetadata,
        },
      });

      await this.prisma.requestDeposit.update({
        where: { id: reqDeposit.id },
        data: {
          nominalTambahan: feeAdmin,
        },
      });

      return {
        error: false,
        data: {
          transaction_id: updatedTx.uuid,
          payment_method: paymentMethod,
          bank_code: bankCode,
          bank_name: updatedTx.bank_name,
          virtual_account: updatedTx.virtual_account,
          amount: Number(updatedTx.amount),
          fee_admin: Number(updatedTx.fee_admin),
          total_amount: Number(updatedTx.total_amount),
          expired_at: updatedTx.expired_at,
          status: updatedTx.status,
          partner_reff: updatedTx.partner_reff,
          qris_text: qrisText,
          imageqris: responseData.imageqris,
          checkout_url: checkoutUrl,
        },
      };

    } catch (error) {
      this.logger.error('Error saat proses deposit LinkQu:', error);
      return {
        error: true,
        error_msg: 'Terjadi kesalahan sistem saat memproses deposit',
      };
    }
  }

  async getPaymentGatewayDetail(memberId: number, idOrUuid: string) {
    try {
      const isNumeric = /^\d+$/.test(idOrUuid);
      const tx = await this.prisma.paymentGatewayTransaction.findFirst({
        where: {
          reference_id: memberId.toString(),
          OR: [
            { uuid: idOrUuid },
            { partner_reff: idOrUuid },
            ...(isNumeric ? [{ id: Number(idOrUuid) }, { requestDepositId: Number(idOrUuid) }] : []),
          ],
        },
        include: { requestDeposit: true },
      });

      if (!tx) {
        return { error: true, error_msg: 'Data transaksi pembayaran tidak ditemukan' };
      }

      let metadataObj: any = {};
      try {
        metadataObj = JSON.parse(tx.metadata || '{}');
      } catch {}

      return {
        error: false,
        data: {
          transaction_id: tx.uuid,
          payment_method: tx.payment_method,
          bank_code: tx.bank_code,
          bank_name: tx.bank_name,
          virtual_account: tx.virtual_account,
          amount: Number(tx.amount),
          fee_admin: Number(tx.fee_admin),
          total_amount: Number(tx.total_amount),
          expired_at: tx.expired_at,
          status: tx.status,
          partner_reff: tx.partner_reff,
          qris_text: metadataObj.qris_text,
          imageqris: metadataObj.imageqris,
          checkout_url: metadataObj.checkout_url,
        },
      };
    } catch (error) {
      this.logger.error('Error getPaymentGatewayDetail:', error);
      return { error: true, error_msg: 'Gagal mengambil detail pembayaran' };
    }
  }
}
