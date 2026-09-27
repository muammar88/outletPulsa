import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class DigiflazzService {
  private readonly logger = new Logger(DigiflazzService.name);

  private get username(): string {
    return process.env.DIGIFLAZZ_USERNAME || '';
  }

  private get apiKey(): string {
    const key = process.env.DIGIFLAZZ_MODE === 'production' 
      ? process.env.DIGIFLAZZ_PRODUCTION_KEY 
      : process.env.DIGIFLAZZ_DEVELOPMENT_KEY;
    return key || '';
  }

  private get baseUrl(): string {
    return 'https://api.digiflazz.com/v1';
  }

  private signMd5(suffix: string): string {
    return crypto.createHash('md5').update(this.username + this.apiKey + suffix).digest('hex');
  }

  async checkBalance(): Promise<{ balance: number; isSuccess: boolean; errorMsg: string }> {
    try {
      const sign = this.signMd5('depo');
      const response = await fetch(`${this.baseUrl}/cek-saldo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ cmd: 'deposit', username: this.username, sign })
      });
      const json = await response.json();
      
      if (json.data && json.data.deposit !== undefined) {
        return { balance: json.data.deposit, isSuccess: true, errorMsg: '' };
      }
      return { balance: 0, isSuccess: false, errorMsg: 'Data saldo Digiflazz tidak valid' };
    } catch (error: any) {
      this.logger.error('DIGIFLAZZ CheckBalance Error', error);
      return { balance: 0, isSuccess: false, errorMsg: error.message };
    }
  }

  async topUp(ref_id: string, customer_no: string, kode_produk: string): Promise<any> {
    const sign = this.signMd5(ref_id);
    const body = {
      username: this.username,
      buyer_sku_code: kode_produk,
      customer_no: customer_no,
      ref_id: ref_id,
      sign: sign,
    };

    try {
      const response = await fetch(`${this.baseUrl}/transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      this.logger.log(`DIGIFLAZZ Response: ${JSON.stringify(data)}`);

      let isSuccess = false;
      if (data && data.data && (data.data.rc === '00' || data.data.rc === '03')) {
        isSuccess = true;
      }

      return {
        trx_id: data?.data?.trx_id || '',
        status_success: isSuccess,
        price: data?.data?.price || 0,
        rc: data?.data?.rc || '',
        raw_response: data,
        sn: data?.data?.sn || '',
      };
    } catch (error) {
      this.logger.error('DIGIFLAZZ TopUp Error', error);
      return { status_success: false, trx_id: '', raw_response: error };
    }
  }

  async checkStatus(ref_id: string, customer_no: string, kode_produk: string): Promise<{ status: string; sn: string; raw: any }> {
    const sign = this.signMd5(ref_id);

    try {
      const response = await fetch(`${this.baseUrl}/transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: this.username,
          buyer_sku_code: kode_produk,
          customer_no: customer_no,
          ref_id: ref_id,
          sign: sign,
        }),
      });
      const data = await response.json();


      console.log()

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

  async getPricelist(): Promise<any> {
    const sign = this.signMd5('pricelist');
    const response = await fetch(`${this.baseUrl}/price-list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        cmd: "prepaid",
        username: this.username,
        sign,
      })
    });

    const bodyText = await response.text();
    const opJson = JSON.parse(bodyText);

    if (opJson.data && Array.isArray(opJson.data)) {
      return opJson.data;
    } else {
      const digiflazzMessage = opJson.data?.message || opJson.message || JSON.stringify(opJson);
      throw new BadRequestException(`Format response Digiflazz tidak valid. Pesan dari server: ${digiflazzMessage}`);
    }
  }

  /**
   * Katalog pascabayar (cmd: pasca).
   * Sengaja dipisah dari getPricelist() prabayar agar katalog tidak tercampur.
   */
  async getPascabayarPricelist(): Promise<any[]> {
    const sign = this.signMd5('pricelist');
    const response = await fetch(`${this.baseUrl}/price-list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        cmd: 'pasca',
        username: this.username,
        sign,
      }),
    });

    const bodyText = await response.text();
    let opJson: any;
    try {
      opJson = JSON.parse(bodyText);
    } catch {
      throw new BadRequestException('Respons katalog pascabayar Digiflazz bukan JSON yang valid');
    }

    if (opJson.data && Array.isArray(opJson.data)) {
      return opJson.data;
    }
    const message = opJson.data?.message || opJson.message || JSON.stringify(opJson);
    throw new BadRequestException(`Format response katalog pascabayar Digiflazz tidak valid. Pesan dari server: ${message}`);
  }

  /**
   * Transaksi pascabayar generik (inq-pasca | pay-pasca | status-pasca).
   * Signature = MD5(username + apiKey + ref_id).
   */
  async transactionPascabayar(options: {
    command: 'inq-pasca' | 'pay-pasca' | 'status-pasca';
    refId: string;
    sku: string;
    customerNo: string;
    additionalData?: Record<string, unknown> | null;
  }): Promise<any> {
    const sign = this.signMd5(options.refId);
    // additionalData lebih dulu agar tidak dapat menimpa field wajib (commands/sign/dll).
    const body: Record<string, unknown> = {
      ...(options.additionalData ?? {}),
      commands: options.command,
      username: this.username,
      buyer_sku_code: options.sku,
      customer_no: options.customerNo,
      ref_id: options.refId,
      sign,
    };

    const response = await fetch(`${this.baseUrl}/transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      this.logger.error(`DIGIFLAZZ ${options.command} bukan JSON: ${text?.slice(0, 200)}`);
      throw new BadRequestException(`Respons Digiflazz ${options.command} tidak valid`);
    }
    this.logger.log(`DIGIFLAZZ ${options.command} Response: ${JSON.stringify(data)}`);
    return data;
  }

  async inquiryPascabayar(ref_id: string, customer_no: string, kode_produk: string): Promise<any> {
    return this.transactionPascabayar({ command: 'inq-pasca', refId: ref_id, sku: kode_produk, customerNo: customer_no });
  }

  async payPascabayar(ref_id: string, customer_no: string, kode_produk: string): Promise<any> {
    return this.transactionPascabayar({ command: 'pay-pasca', refId: ref_id, sku: kode_produk, customerNo: customer_no });
  }

  async statusPascabayar(ref_id: string, customer_no: string, kode_produk: string): Promise<any> {
    return this.transactionPascabayar({ command: 'status-pasca', refId: ref_id, sku: kode_produk, customerNo: customer_no });
  }
}
