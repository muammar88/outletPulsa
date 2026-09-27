import { Injectable, Logger, BadRequestException } from '@nestjs/common';
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
    // Kontrak IAK pascabayar: development testpostpaid.mobilepulsa.net,
    // production mobilepulsa.net (bukan domain postpaid.iak.dev/id).
    return this.isDev ? 'https://testpostpaid.mobilepulsa.net' : 'https://mobilepulsa.net';
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
          status: 'all'
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
          status: 'all'
        })
      });
      return await response.json();
    }
  }

  /** Timeout fetch IAK; AbortController membatalkan koneksi dan pembacaan body. */
  private static readonly REQUEST_TIMEOUT_MS = 30000;

  /** Field inti yang tidak boleh ditimpa input tambahan kategori. */
  private static readonly RESERVED_FIELDS = [
    'commands',
    'username',
    'sign',
    'ref_id',
    'tr_id',
    'code',
    'hp',
    'customer_id',
    'product_code',
  ];

  /**
   * Field input tambahan yang didukung per kategori pascabayar IAK.
   *
   * Hanya kategori dengan kontrak input yang sudah terverifikasi dimasukkan di
   * sini. Kategori/field lain ditolak sebelum request dikirim, bukan diteruskan
   * mentah-mentah. PLN hanya memakai `code`/`hp` sehingga allowlist-nya kosong.
   */
  private static readonly CATEGORY_INPUT_ALLOWLIST: Record<string, string[]> = {
    pln: [],
  };

  /**
   * Transaksi pascabayar IAK.
   *
   * Kontrak resmi IAK postpaid (dokumen kontrak offline 27 September 2026):
   * - endpoint POST /api/v1/bill/check (tanpa suffix kategori).
   * - inquiry PLN: commands=inq-pasca, code (SKU), hp (nomor), ref_id, sign(ref_id).
   * - pembayaran: commands=pay-pasca, tr_id hasil inquiry IAK, sign(tr_id).
   * - status: commands=checkstatus, ref_id, sign literal "cs" (BUKAN status-pasca).
   *
   * Nama operasi internal dipertahankan agar router kompatibel, tetapi
   * diterjemahkan menjadi checkstatus pada batas HTTP IAK.
   */
  async transactionPascabayar(options: {
    command: 'inq-pasca' | 'pay-pasca' | 'status-pasca';
    refId: string;
    trId?: string | null;
    sku: string;
    customerNo: string;
    additionalData?: Record<string, unknown> | null;
    providerType?: string | null;
  }): Promise<any> {
    const trId = options.trId ? String(options.trId).trim() : '';
    if (options.command === 'pay-pasca' && !trId) {
      throw new BadRequestException('Pembayaran IAK membutuhkan tr_id hasil inquiry');
    }
    const url = `${this.postpaidBaseUrl}/api/v1/bill/check`;
    const body = this.buildPascaBody(options, trId);
    return this.postJson(url, body, options.command);
  }

  private buildPascaBody(
    options: {
      command: 'inq-pasca' | 'pay-pasca' | 'status-pasca';
      refId: string;
      sku: string;
      customerNo: string;
      additionalData?: Record<string, unknown> | null;
      providerType?: string | null;
    },
    trId: string,
  ): Record<string, unknown> {
    if (options.command === 'pay-pasca') {
      // Pembayaran hanya memakai tr_id; ref_id/code/hp bukan bagian kontrak.
      return { commands: 'pay-pasca', username: this.username, tr_id: trId, sign: this.signMd5(trId) };
    }
    if (options.command === 'status-pasca') {
      // checkstatus memakai ref_id dan suffix literal "cs".
      return {
        commands: 'checkstatus',
        username: this.username,
        ref_id: options.refId,
        sign: this.signMd5('cs'),
      };
    }
    // Inquiry PLN memakai code/hp; customer_id/product_code bukan penggantinya.
    return {
      ...this.validatedAdditionalData(options.additionalData, options.providerType),
      commands: 'inq-pasca',
      username: this.username,
      code: options.sku,
      hp: options.customerNo,
      ref_id: options.refId,
      sign: this.signMd5(options.refId),
    };
  }

  /** Kategori pascabayar IAK dari providerType; default `pln` bila kosong. */
  private resolveCategory(providerType?: string | null): string {
    return String(providerType ?? '').trim().toLowerCase() || 'pln';
  }

  /**
   * Validasi input tambahan kategori memakai allowlist.
   *
   * Kategori yang belum didukung dan field yang tidak ada di allowlist ditolak
   * (bukan diteruskan), sehingga tidak mungkin menimpa command/sign/credential
   * maupun mengirim input yang belum terdefinisi kontraknya.
   */
  private validatedAdditionalData(
    data: Record<string, unknown> | null | undefined,
    providerType?: string | null,
  ): Record<string, unknown> {
    const category = this.resolveCategory(providerType);
    const allowed = IakService.CATEGORY_INPUT_ALLOWLIST[category];
    if (!allowed) {
      throw new BadRequestException(`Kategori pascabayar IAK '${category}' belum didukung`);
    }
    if (!data || typeof data !== 'object') return {};
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (IakService.RESERVED_FIELDS.includes(key) || !allowed.includes(key)) {
        throw new BadRequestException(
          `Input '${key}' belum didukung untuk kategori pascabayar IAK '${category}'`,
        );
      }
      out[key] = value;
    }
    return out;
  }

  /** POST JSON dengan timeout yang benar-benar membatalkan koneksi dan body. */
  private async postJson(url: string, body: Record<string, unknown>, label: string): Promise<any> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), IakService.REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      const text = await response.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        this.logger.error(`IAK ${label} bukan JSON: ${text?.slice(0, 200)}`);
        throw new BadRequestException(`Respons IAK ${label} tidak valid`);
      }
      this.logger.log(`IAK ${label} Response: ${JSON.stringify(data)}`);
      return data;
    } finally {
      clearTimeout(timer);
    }
  }
}
