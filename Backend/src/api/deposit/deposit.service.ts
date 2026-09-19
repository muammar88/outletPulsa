import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { DepositSaldoDto } from './dto/deposit-saldo.dto';
import { DepositLinkquDto } from './dto/deposit-linkqu.dto';
import { PengumumanService } from '../../pengumuman/pengumuman.service';
import * as crypto from 'crypto';

@Injectable()
export class DepositService {
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

  async processLinkquDeposit(memberId: number, body: DepositLinkquDto) {
    if (!memberId) {
      return { error: true, error_msg: 'Id Member Tidak Ditemukan.' };
    }

    try {
      const pengaturan = await this.prisma.pengaturanUmum.findFirst();
      if (!pengaturan || !pengaturan.linkqu_is_active) {
        return { error: true, error_msg: 'Layanan LinkQu sedang tidak aktif' };
      }

      const member = await this.prisma.member.findUnique({ where: { id: memberId } });
      if (!member) {
        return { error: true, error_msg: 'Member tidak ditemukan' };
      }

      let rawNominal = typeof body.nominal === 'string' ? body.nominal.replace(/[^0-9]/g, '') : body.nominal.toString();
      const nominal = parseInt(rawNominal, 10);

      const clientId = pengaturan.linkqu_client_id || '';
      const clientSecret = pengaturan.linkqu_client_secret || '';
      const signatureKey = pengaturan.linkqu_signature_key || '';
      const username = pengaturan.linkqu_merchant_code || 'LINKQU'; 
      const pin = pengaturan.linkqu_pin || '';
      
      const isSandbox = pengaturan.linkqu_is_sandbox;
      let baseUrl = isSandbox ? pengaturan.linkqu_base_url_dev : pengaturan.linkqu_base_url_prod;
      if (!baseUrl) {
        baseUrl = isSandbox ? 'https://gateway-dev.linkqu.id' : 'https://api.linkqu.id';
      }
      baseUrl = baseUrl.replace(/\/+$/, '').replace(/\/linkqu-partner$/, '');
      const baseUrlWebhook = 'https://outletpulsa.com/api/webhook/linkqu'; // adjust if needed

      const nowEpoch = new Date().getTime();
      const expiryUTC7 = new Date(nowEpoch + (9 * 60 * 60 * 1000)); 
      
      const expired = expiryUTC7.getUTCFullYear().toString() + 
        (expiryUTC7.getUTCMonth() + 1).toString().padStart(2, '0') + 
        expiryUTC7.getUTCDate().toString().padStart(2, '0') + 
        expiryUTC7.getUTCHours().toString().padStart(2, '0') + 
        expiryUTC7.getUTCMinutes().toString().padStart(2, '0') + 
        expiryUTC7.getUTCSeconds().toString().padStart(2, '0');

      const expiredAtDB = new Date(nowEpoch + (2 * 60 * 60 * 1000)); 

      let apiPath = '';
      let signPath = '';
      
      let payload: any = {
        amount: nominal,
        partner_reff: `DP-${memberId}-${Date.now()}`,
        customer_id: memberId.toString(),
        customer_name: member.fullname || 'Member',
        expired: expired,
        username: username,
        pin: pin,
        customer_phone: member.whatsappnumber || '081234567890',
        customer_email: 'user@example.com',
      };

      const paymentMethod = body.payment_method;
      const bankCode = body.bank_code;

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
        payload.ewallet_phone = member.whatsappnumber || '081234567890';
        payload.bill_title = 'Deposit Outlet Pulsa';
        payload.url_callback = `${baseUrlWebhook}/ewallet`;
      } else {
        return { error: true, error_msg: 'Metode pembayaran tidak valid' };
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

      const response = await fetch(`${baseUrl}${apiPath}`, {
        method: 'POST',
        headers: {
          'client-id': clientId,
          'client-secret': clientSecret,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const responseText = await response.text();
      let responseData: any;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        return { error: true, error_msg: 'Error saat menghubungkan ke LinkQu' };
      }
      
      if (!response.ok || responseData.response_code !== '00' || responseData.status !== 'SUCCESS') {
        return { error: true, error_msg: responseData.response_desc || responseData.rd || responseData.message || 'Gagal membuat transaksi' };
      }

      const kodeTrans = await this.newCodeTransDeposit();
      const myDate = new Date();

      let createdTx: any = null;
      await this.prisma.$transaction(async (tx) => {
        const iRiwayat = await tx.riwayatTransaksi.create({
          data: {
            memberId: memberId,
            tipeTransaksi: 'deposit',
            createdAt: myDate,
            updatedAt: myDate,
          },
        });

        const reqDeposit = await tx.requestDeposit.create({
          data: {
            kode: kodeTrans,
            riwayatTransaksiId: iRiwayat.id,
            nominal: nominal,
            nominalTambahan: responseData.feeadmin || 0, 
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
            partner_reff: payload.partner_reff,
            payment_method: paymentMethod,
            bank_code: bankCode,
            bank_name: bankCode === '013' ? 'Permata' : (responseData.bank_name || bankCode),
            virtual_account: responseData.virtual_account || responseData.va_number || responseData.checkout_url,
            amount: nominal,
            fee_admin: responseData.feeadmin || 0,
            total_amount: nominal + (responseData.feeadmin || 0),
            expired_at: expiredAtDB,
            status: 'PENDING',
            provider: 'LINKQU',
            requestDepositId: reqDeposit.id,
            metadata: JSON.stringify(responseData),
          }
        });
      });

      return {
        error: false,
        data: {
          transaction_id: createdTx?.uuid,
          payment_method: paymentMethod,
          bank_code: bankCode,
          bank_name: createdTx?.bank_name,
          virtual_account: createdTx?.virtual_account,
          amount: Number(createdTx?.amount),
          fee_admin: Number(createdTx?.fee_admin),
          total_amount: Number(createdTx?.total_amount),
          expired_at: createdTx?.expired_at,
          status: createdTx?.status,
          partner_reff: createdTx?.partner_reff,
          qris_text: responseData.qris_text,
          imageqris: responseData.imageqris,
          checkout_url: responseData.checkout_url,
        }
      };

    } catch (error) {
      console.error(error);
      return {
        error: true,
        error_msg: 'Terjadi kesalahan sistem saat memproses deposit',
      };
    }
  }
}
