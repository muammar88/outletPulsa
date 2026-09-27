import { Injectable, Logger } from '@nestjs/common';
import { DigiflazzService } from '../digiflazz.service';
import {
  PascabayarAdapter,
  PascabayarInquiryInput,
  PascabayarNormalizedInquiry,
  PascabayarNormalizedPay,
  PascabayarPayInput,
} from './pascabayar.types';
import { asRecord, pick, statusFromText, toIntOrNull } from './pascabayar-normalize';

/**
 * Adapter Digiflazz pascabayar.
 *
 * Kontrak: POST /v1/transaction dengan commands inq-pasca | pay-pasca | status-pasca,
 * signature MD5(username + apiKey + ref_id), respons dibungkus `data`.
 *
 * Catatan penting: `price` = tagihan pelanggan, `admin` = biaya admin provider,
 * `selling_price` = total yang dibayar buyer ke provider, `commission` = komisi
 * katalog. Adapter tidak menebak; nilai yang tidak ada dikembalikan null.
 */
@Injectable()
export class DigiflazzPascabayarAdapter implements PascabayarAdapter {
  readonly provider = 'DIGIFLAZZ' as const;
  private readonly logger = new Logger(DigiflazzPascabayarAdapter.name);

  constructor(private readonly digiflazz: DigiflazzService) {}

  async inquiry(input: PascabayarInquiryInput): Promise<PascabayarNormalizedInquiry> {
    try {
      const raw = await this.digiflazz.transactionPascabayar({
        command: 'inq-pasca',
        refId: input.refId,
        sku: input.sku,
        customerNo: input.customerNo,
        additionalData: input.additionalData,
      });
      return this.normalizeInquiry(raw, input);
    } catch (error) {
      this.logger.error(`[DIGIFLAZZ PASCA] Inquiry gagal: ${(error as Error).message}`);
      return this.ambiguousInquiry(input, 'Koneksi ke Digiflazz gagal');
    }
  }

  async pay(input: PascabayarPayInput): Promise<PascabayarNormalizedPay> {
    try {
      const raw = await this.digiflazz.transactionPascabayar({
        command: 'pay-pasca',
        refId: input.refId,
        sku: input.sku,
        customerNo: input.customerNo,
        additionalData: input.additionalData,
      });
      return this.normalizePay(raw, 'Koneksi ke Digiflazz gagal setelah permintaan dikirim');
    } catch (error) {
      this.logger.error(`[DIGIFLAZZ PASCA] Pay gagal: ${(error as Error).message}`);
      return this.ambiguousPay('Koneksi ke Digiflazz gagal setelah permintaan dikirim');
    }
  }

  async status(input: PascabayarPayInput): Promise<PascabayarNormalizedPay> {
    try {
      const raw = await this.digiflazz.transactionPascabayar({
        command: 'status-pasca',
        refId: input.refId,
        sku: input.sku,
        customerNo: input.customerNo,
        additionalData: input.additionalData,
      });
      return this.normalizePay(raw, 'Status tidak dapat dipastikan');
    } catch (error) {
      this.logger.error(`[DIGIFLAZZ PASCA] Status gagal: ${(error as Error).message}`);
      return this.ambiguousPay('Status tidak dapat dipastikan');
    }
  }

  private normalizeInquiry(raw: unknown, input: PascabayarInquiryInput): PascabayarNormalizedInquiry {
    const data = asRecord(asRecord(raw).data);
    const rc = String(pick(data, 'rc') ?? '');
    const statusText = statusFromText(pick(data, 'status'));
    const message = String(pick(data, 'message', 'keterangan', 'desc') ?? '');
    const billAmount = toIntOrNull(pick(data, 'price', 'bill_amount', 'billAmount'));
    const ok = rc === '00' && statusText !== 'gagal' && billAmount !== null;

    if (!ok) {
      this.logger.warn(`[DIGIFLAZZ PASCA] Inquiry tidak sukses rc=${rc} msg=${message}`);
    }

    return {
      ok,
      status: ok ? 'sukses' : statusText ?? (rc === '03' ? 'pending' : 'tidak_diketahui'),
      rc,
      message,
      customerName: (pick(data, 'customer_name', 'customerName') as string | undefined) ?? null,
      customerNo: String(pick(data, 'customer_no', 'customerNo') ?? input.customerNo),
      billAmount,
      providerAdminFee: toIntOrNull(pick(data, 'admin')),
      providerCommission: toIntOrNull(pick(data, 'commission', 'komisi')),
      providerSellingPrice: toIntOrNull(pick(data, 'selling_price', 'sellingPrice')),
      period: (pick(data, 'periode', 'period', 'desc') as string | undefined) ?? null,
      detail: data,
      raw,
    };
  }

  private normalizePay(raw: unknown, ambiguousMessage: string): PascabayarNormalizedPay {
    const root = asRecord(raw);
    const data = asRecord(root.data ?? root);
    const rc = String(pick(data, 'rc') ?? '');
    const statusText = statusFromText(pick(data, 'status'));

    if (!raw) {
      return this.ambiguousPay(ambiguousMessage);
    }

    let status: PascabayarNormalizedPay['status'] = 'tidak_diketahui';
    if (statusText) {
      status = statusText;
    } else if (rc === '00') {
      status = 'sukses';
    } else if (rc === '03') {
      status = 'pending';
    }

    return {
      status,
      // Hanya teks status eksplisit gagal yang dianggap definitif.
      definitiveFailure: statusText === 'gagal',
      rc,
      message: String(pick(data, 'message', 'keterangan', 'desc') ?? ''),
      sn: (pick(data, 'sn', 'serial_number') as string | undefined) ?? null,
      providerRefId: (pick(data, 'tr_id', 'trId') as string | undefined) ?? null,
      actualBillAmount: toIntOrNull(pick(data, 'price', 'bill_amount')),
      actualProviderAdminFee: toIntOrNull(pick(data, 'admin')),
      raw,
    };
  }

  private ambiguousInquiry(input: PascabayarInquiryInput, message: string): PascabayarNormalizedInquiry {
    return {
      ok: false,
      status: 'tidak_diketahui',
      rc: '',
      message,
      customerName: null,
      customerNo: input.customerNo,
      billAmount: null,
      providerAdminFee: null,
      providerCommission: null,
      providerSellingPrice: null,
      period: null,
      detail: {},
      raw: null,
    };
  }

  private ambiguousPay(message: string): PascabayarNormalizedPay {
    return {
      status: 'tidak_diketahui',
      definitiveFailure: false,
      rc: '',
      message,
      sn: null,
      providerRefId: null,
      actualBillAmount: null,
      actualProviderAdminFee: null,
      raw: null,
    };
  }
}

