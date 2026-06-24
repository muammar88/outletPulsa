import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class IakService {
  private readonly logger = new Logger(IakService.name);

  private get username(): string {
    let rawUsername = process.env.IAK_USERNAME || '';
    if (String(rawUsername).includes('e+')) {
      rawUsername = Number(rawUsername).toString();
    }
    return String(rawUsername).padStart(12, '0');
  }

  private get apiKey(): string {
    const key = process.env.IAK_MODE === 'production' 
      ? process.env.IAK_KEY_PRODUCTION 
      : process.env.IAK_KEY_DEVELOPMENT;
    return key || '';
  }

  private get isDev(): boolean {
    return process.env.IAK_MODE !== 'production';
  }

  private get prepaidBaseUrl(): string {
    return this.isDev ? 'https://prepaid.iak.dev' : 'https://prepaid.iak.id';
  }

  private get postpaidBaseUrl(): string {
    return this.isDev ? 'https://postpaid.iak.dev' : 'https://postpaid.iak.id';
  }

  private signMd5(suffix: string): string {
    return crypto.createHash('md5').update(this.username + this.apiKey + suffix).digest('hex');
  }

  async checkBalance(): Promise<{ balance: number; isSuccess: boolean; errorMsg: string }> {
    try {
      const sign = this.signMd5('bl');
      const response = await fetch(`${this.prepaidBaseUrl}/api/check-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ username: this.username, sign })
      });
      const json = await response.json();
      
      if (json.data && json.data.balance !== undefined) {
        return { balance: json.data.balance, isSuccess: true, errorMsg: '' };
      }
      return { balance: 0, isSuccess: false, errorMsg: 'Data saldo IAK tidak valid' };
    } catch (error: any) {
      this.logger.error('IAK CheckBalance Error', error);
      return { balance: 0, isSuccess: false, errorMsg: error.message };
    }
  }

  async topUp(ref_id: string, customer_no: string, kode_produk: string): Promise<any> {
    const sign = this.signMd5(ref_id);

    const body = {
      username: this.username,
      customer_id: customer_no,
      ref_id: ref_id,
      product_code: kode_produk,
      sign: sign,
    };

    try {
      const response = await fetch(`${this.prepaidBaseUrl}/api/top-up`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      this.logger.log(`IAK Response: ${JSON.stringify(data)}`);

      let isSuccess = false;
      if (data && data.data && (data.data.status === '0' || data.data.status === '1' || data.data.status === 0 || data.data.status === 1)) {
        isSuccess = true;
      }

      return {
        trx_id: data?.data?.tr_id || '',
        status_success: isSuccess,
        price: data?.data?.price || 0,
        raw_response: data,
        sn: data?.data?.sn || '',
      };
    } catch (error) {
      this.logger.error('IAK TopUp Error', error);
      return { status_success: false, trx_id: '', raw_response: error };
    }
  }

  async checkStatus(ref_id: string): Promise<{ status: string; sn: string; raw: any }> {
    const sign = this.signMd5(ref_id);

    try {
      const response = await fetch(`${this.prepaidBaseUrl}/api/check-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: this.username, ref_id, sign }),
      });
      const data = await response.json();
      
      let status = 'proses';
      let sn = '';
      if (data?.data) {
        if (data.data.status === '0' || data.data.status === 0) status = 'proses';
        else if (data.data.status === '1' || data.data.status === 1) status = 'sukses';
        else if (data.data.status === '2' || data.data.status === 2) status = 'gagal';
        sn = data.data.sn || '';
      }
      return { status, sn, raw: data };
    } catch (error) {
      this.logger.error('IAK CheckStatus Error', error);
      return { status: 'proses', sn: '', raw: null };
    }
  }

  async getPricelist(type: 'prepaid' | 'postpaid', prepaidType?: string, prepaidOperator?: string): Promise<any> {
    const sign = this.signMd5('pl');

    if (type === 'prepaid') {
      const url = `${this.prepaidBaseUrl}/api/pricelist/${prepaidType}/${prepaidOperator}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          username: this.username,
          sign,
          status: "all"
        })
      });
      return await response.json();
    } else {
      const url = prepaidType ? `${this.postpaidBaseUrl}/api/v1/bill/check/${prepaidType}` : `${this.postpaidBaseUrl}/api/v1/bill/check`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          commands: 'pricelist-pasca',
          username: this.username,
          sign,
          status: "all"
        })
      });
      return await response.json();
    }
  }
}
