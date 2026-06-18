import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class ProviderService {
  private readonly logger = new Logger(ProviderService.name);

  private md5(data: string): string {
    return crypto.createHash('md5').update(data).digest('hex');
  }

  async topUpIak(ref_id: string, customer_no: string, kode_produk: string): Promise<any> {
    const username = process.env.IAK_USERNAME || '';
    const apiKey = process.env.IAK_MODE === 'production' 
        ? process.env.IAK_KEY_PRODUCTION  
        : process.env.IAK_KEY_DEVELOPMENT;
    const isDev = process.env.IAK_MODE !== 'production';
    const url = isDev ? 'https://prepaid.iak.dev/api/top-up' : 'https://prepaid.iak.id/api/top-up';
    const sign = this.md5(username + apiKey + ref_id);

    console.log("Log Top Up IAK------------------------");
    console.log("username", username);
    console.log("apiKey", apiKey);
    console.log("ref_id", ref_id);
    console.log("customer_no", customer_no);
    console.log("kode_produk", kode_produk);
    console.log("mode", isDev);
    console.log("mode_app", process.env.IAK_MODE);
    console.log("url", url);
    console.log("sign", sign);
    console.log("Log Top Up IAK------------------------");

    const body = {
      username: username,
      customer_id: customer_no,
      ref_id: ref_id,
      product_code: kode_produk,
      sign: sign,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      };
    } catch (error) {
      this.logger.error('IAK TopUp Error', error);
      return { status_success: false, trx_id: '', raw_response: error };
    }
  }

  async topUpTripay(ref_id: string, customer_no: string, kode_produk: string, isPln: boolean = false): Promise<any> {
    const apiKey = process.env.TRIPAY_API_KEY || process.env.TRIPAY_KEY || '';
    const isDev = process.env.TRIPAY_MODE !== 'production';
    const url = isDev ? 'https://tripay.id/api-sandbox/v2/transaksi/pembelian' : 'https://tripay.id/api/v2/transaksi/pembelian';
    
    // Default PIN dummy kalau belum ada di ENV (biasanya di setting tripay)
    const pin = process.env.TRIPAY_PIN || '9089'; 

    const body: any = {
      code: kode_produk,
      api_trxid: ref_id,
      pin: pin,
    };

    if (isPln) {
      body.inquiry = 'PLN';
      body.no_meter_pln = customer_no;
      body.phone = process.env.ADMIN_PHONE || '085262802141'; // Admin phone
    } else {
      body.inquiry = 'I';
      body.phone = customer_no;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      this.logger.log(`TRIPAY Response: ${JSON.stringify(data)}`);

      return {
        trx_id: data?.trxid || '',
        status_success: data?.success || false,
        raw_response: data,
      };
    } catch (error) {
      this.logger.error('TRIPAY TopUp Error', error);
      return { status_success: false, trx_id: '', raw_response: error };
    }
  }

  async topUpDigiflazz(ref_id: string, customer_no: string, kode_produk: string): Promise<any> {
    const username = process.env.DIGIFLAZZ_USERNAME || '';
    const apiKey = (process.env.DIGIFLAZZ_MODE === 'production' 
      ? process.env.DIGIFLAZZ_PRODUCTION_KEY 
      : process.env.DIGIFLAZZ_DEVELOPMENT_KEY) || '';
    const url = 'https://api.digiflazz.com/v1/transaction';

    const sign = this.md5(username + apiKey + ref_id);
    const body = {
      username: username,
      buyer_sku_code: kode_produk,
      customer_no: customer_no,
      ref_id: ref_id,
      sign: sign,
      // testing: true // Optional for digiflazz dev
    };


    console.log("Log Top Up DIGIFLAZZ------------------------");
    
    console.log(username);
    console.log(process.env.DIGIFLAZZ_MODE);
    console.log(apiKey);
    console.log(ref_id);
    console.log(body);
    console.log("Log Top Up DIGIFLAZZ------------------------");

    

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      console.log("Log Top Up DIGIFLAZZ------------------------11111");
      console.log(response);
      console.log("Log Top Up DIGIFLAZZ------------------------11111");

      const data = await response.json();
      this.logger.log(`DIGIFLAZZ Response: ${JSON.stringify(data)}`);

      let isSuccess = false;
      if (data && data.data && (data.data.rc === '00' || data.data.rc === '03')) {
        isSuccess = true;
      }

      return {
        trx_id: data?.data?.trx_id || '', // digiflazz mungkin tdk mereflect trx_id secara sama, default ''
        status_success: isSuccess,
        price: data?.data?.price || 0,
        rc: data?.data?.rc || '',
        raw_response: data,
      };
    } catch (error) {
      this.logger.error('DIGIFLAZZ TopUp Error', error);
      return { status_success: false, trx_id: '', raw_response: error };
    }
  }

  async checkStatusIak(ref_id: string): Promise<{ status: string; sn: string; raw: any }> {
    const username = process.env.IAK_USERNAME || '';
    const apiKey = process.env.IAK_KEY || '';
    const isDev = process.env.IAK_MODE !== 'production';
    const url = isDev ? 'https://prepaid.iak.dev/api/check-status' : 'https://prepaid.iak.id/api/check-status';

    const sign = this.md5(username + apiKey + ref_id);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, ref_id, sign }),
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

  async checkStatusTripay(trx_id: string, ref_id: string): Promise<{ status: string; sn: string; raw: any }> {
    const apiKey = process.env.TRIPAY_API_KEY || process.env.TRIPAY_KEY || '';
    const isDev = process.env.TRIPAY_MODE !== 'production';
    const url = isDev ? 'https://tripay.id/api-sandbox/v2/histori/transaksi/detail' : 'https://tripay.id/api/v2/histori/transaksi/detail';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey,
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
        sn = data.data.note || ''; // Tripay SN is usually in note
      }
      return { status, sn, raw: data };
    } catch (error) {
      this.logger.error('TRIPAY CheckStatus Error', error);
      return { status: 'proses', sn: '', raw: null };
    }
  }

  async checkStatusDigiflazz(ref_id: string, customer_no: string, kode_produk: string): Promise<{ status: string; sn: string; raw: any }> {
    const username = process.env.DIGIFLAZZ_USERNAME || '';
    const apiKey = (process.env.DIGIFLAZZ_MODE === 'production' 
      ? process.env.DIGIFLAZZ_PRODUCTION_KEY 
      : process.env.DIGIFLAZZ_DEVELOPMENT_KEY) || '';
    const url = 'https://api.digiflazz.com/v1/transaction';

    const sign = this.md5(username + apiKey + ref_id);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username,
          buyer_sku_code: kode_produk,
          customer_no: customer_no,
          ref_id: ref_id,
          sign: sign,
        }),
      });
      const data = await response.json();

      let status = 'proses';
      let sn = '';
      if (data?.data) {
        const digiStatus = data.data.status?.toLowerCase();
        if (digiStatus === 'sukses') status = 'sukses';
        else if (digiStatus === 'gagal') status = 'gagal';
        else status = 'proses';
        sn = data.data.sn || '';
      }
      return { status, sn, raw: data };
    } catch (error) {
      this.logger.error('DIGIFLAZZ CheckStatus Error', error);
      return { status: 'proses', sn: '', raw: null };
    }
  }
}
