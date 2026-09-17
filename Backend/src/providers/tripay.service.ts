import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class TripayService {
  private readonly logger = new Logger(TripayService.name);

  constructor(private prisma: PrismaService) {}

  private get apiKey(): string {
    return process.env.TRIPAY_API_KEY || process.env.TRIPAY_KEY || '';
  }

  private get privateKey(): string {
    return process.env.TRIPAY_PRIVATE_KEY || '';
  }

  private get merchantCode(): string {
    return process.env.TRIPAY_MERCHANT_CODE || '';
  }

  private get isDev(): boolean {
    return process.env.TRIPAY_MODE !== 'production';
  }

  // Payment Gateway Base URL
  private get pgBaseUrl(): string {
    return this.isDev ? 'https://tripay.co.id/api-sandbox' : 'https://tripay.co.id/api';
  }

  // PPOB Base URL
  private get ppobBaseUrl(): string {
    return this.isDev ? 'https://tripay.id/api-sandbox/v2' : 'https://tripay.id/api/v2';
  }

  // ==========================================
  // PPOB METHODS (Pulsa, PPOB, etc)
  // ==========================================

  async checkBalance(): Promise<{ balance: number; isSuccess: boolean; errorMsg: string }> {
    try {
      const response = await fetch(`${this.ppobBaseUrl}/ceksaldo`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      const json = await response.json();
      
      if (json.success && json.data !== undefined) {
        // Response Tripay: { success: true, message: '...', data: 875 }
        const balanceVal = typeof json.data === 'number' ? json.data : (json.data.saldo || 0);
        return { balance: balanceVal, isSuccess: true, errorMsg: '' };
      }
      return { balance: 0, isSuccess: false, errorMsg: json.message || 'Data saldo Tripay tidak valid' };
    } catch (error: any) {
      this.logger.error('TRIPAY CheckBalance Error', error);
      return { balance: 0, isSuccess: false, errorMsg: error.message };
    }
  }

  async topUp(ref_id: string, customer_no: string, kode_produk: string, isPln: boolean = false): Promise<any> {
    const pin = process.env.TRIPAY_PIN || '9089';

    const body: any = {
      code: kode_produk,
      api_trxid: ref_id,
      pin: pin,
    };

    if (isPln) {
      body.inquiry = 'PLN';
      body.no_meter_pln = customer_no;
      body.phone = process.env.ADMIN_PHONE || '085262802141';
    } else {
      body.inquiry = 'I';
      body.phone = customer_no;
    }

    try {
      const response = await fetch(`${this.ppobBaseUrl}/transaksi/pembelian`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.apiKey,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      this.logger.log(`TRIPAY Response: ${JSON.stringify(data)}`);

      return {
        trx_id: data?.trxid || '',
        status_success: data?.success || false,
        raw_response: data,
        sn: data?.sn || data?.note || '',
      };
    } catch (error) {
      this.logger.error('TRIPAY TopUp Error', error);
      return { status_success: false, trx_id: '', raw_response: error };
    }
  }

  async checkStatus(trx_id: string, ref_id: string): Promise<{ status: string; sn: string; raw: any }> {
    try {
      const response = await fetch(`${this.ppobBaseUrl}/histori/transaksi/detail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.apiKey,
        },
        body: JSON.stringify({ trxid: trx_id, api_trxid: ref_id }),
      });
      const data = await response.json();

      let status = 'proses';
      let sn = '';
      if (data?.success && data?.data) {
        if (data.data.status === '0' || data.data.status === 0) status = 'proses';
        else if (data.data.status === '1' || data.data.status === 1) status = 'sukses';
        else if (data.data.status === '2' || data.data.status === 2) status = 'gagal';
        sn = data.data.note || ''; 
      }
      return { status, sn, raw: data };
    } catch (error) {
      this.logger.error('TRIPAY CheckStatus Error', error);
      return { status: 'proses', sn: '', raw: null };
    }
  }

  async getCategories(type: 'prepaid' | 'postpaid'): Promise<any> {
    const endpoint = type === 'prepaid' ? 'pembelian/category' : 'pembayaran/category';
    const response = await fetch(`${this.ppobBaseUrl}/${endpoint}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' }
    });
    const dataJson = await response.json();
    if (dataJson.success && Array.isArray(dataJson.data)) return dataJson.data;
    throw new BadRequestException(`Format response Tripay kategori tidak valid.`);
  }

  async getOperators(type: 'prepaid' | 'postpaid'): Promise<any> {
    const endpoint = type === 'prepaid' ? 'pembelian/operator' : 'pembayaran/operator';
    const response = await fetch(`${this.ppobBaseUrl}/${endpoint}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' }
    });
    const dataJson = await response.json();
    if (dataJson.success && Array.isArray(dataJson.data)) return dataJson.data;
    throw new BadRequestException(`Format response Tripay operator tidak valid.`);
  }

  async getPricelist(type: 'prepaid' | 'postpaid', operatorId?: string): Promise<any> {
    let url = '';
    if (type === 'prepaid') {
      url = `${this.ppobBaseUrl}/pembelian/produk`;
      if (operatorId) {
        url += `?operator_id=${operatorId}`;
      }
    } else {
      url = `${this.ppobBaseUrl}/pembayaran/produk`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      }
    });

    const bodyText = await response.text();
    const dataJson = JSON.parse(bodyText);

    if (dataJson.success && Array.isArray(dataJson.data)) {
      return dataJson.data;
    } else {
      throw new BadRequestException(`Format response Tripay tidak valid. Pesan dari server: ${dataJson.message || JSON.stringify(dataJson)}`);
    }
  }

  // ==========================================
  // PAYMENT GATEWAY METHODS (Deposit)
  // ==========================================

  async getPaymentChannels() {
    try {
      const response = await fetch(`${this.pgBaseUrl}/merchant/payment-channel`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message);
      }
      return data.data;
    } catch (error: any) {
      this.logger.error('Failed to get Tripay payment channels: ' + error.message);
      throw new BadRequestException('Gagal mengambil channel pembayaran: ' + error.message);
    }
  }

  async calculateFee(amount: number, code: string) {
    try {
      const response = await fetch(`${this.pgBaseUrl}/merchant/fee-calculator?payload[]=${code}&amount=${amount}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message);
      }
      return data.data;
    } catch (error: any) {
      this.logger.error('Failed to calculate Tripay fee: ' + error.message);
      throw new BadRequestException('Gagal menghitung biaya: ' + error.message);
    }
  }

  async createTransaction(requestDepositId: number, method: string, amount: number, customerName: string, customerEmail: string, customerPhone: string) {
    const merchantRef = `DEP-${requestDepositId}-${Date.now()}`;
    const signature = crypto.createHmac('sha256', this.privateKey)
      .update(this.merchantCode + merchantRef + amount)
      .digest('hex');

    const payload = {
      method,
      merchant_ref: merchantRef,
      amount,
      customer_name: customerName || 'Member',
      customer_email: customerEmail || 'member@outletpulsa.com',
      customer_phone: customerPhone || '081234567890',
      order_items: [
        {
          sku: 'DEPOSIT',
          name: `Top Up Saldo ${amount}`,
          price: amount,
          quantity: 1
        }
      ],
      return_url: 'https://outletpulsa.com/redirect',
      expired_time: (Math.floor(Date.now() / 1000) + (24 * 60 * 60)), // 24 hours
      signature
    };

    try {
      const response = await fetch(`${this.pgBaseUrl}/transaction/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message);
      }

      await this.prisma.requestDeposit.update({
        where: { id: requestDepositId },
        data: {
          tripayReference: data.data.reference,
          tripayMerchantRef: merchantRef,
          tripayMethod: method,
          tripayFee: data.data.total_fee,
          checkoutUrl: data.data.checkout_url
        }
      });

      return data.data;
    } catch (error: any) {
      this.logger.error('Failed to create Tripay transaction: ' + error.message);
      throw new BadRequestException('Gagal membuat transaksi: ' + error.message);
    }
  }
}
