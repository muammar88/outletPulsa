import { Injectable, Logger } from '@nestjs/common';
import { IakService } from '../iak.service';
import {
  PascabayarAdapter,
  PascabayarInquiryInput,
  PascabayarNormalizedInquiry,
  PascabayarNormalizedPay,
  PascabayarPayInput,
} from './pascabayar.types';
import { asRecord, pick, statusFromText, toIntOrNull } from './pascabayar-normalize';

/**
 * Adapter IAK pascabayar.
 *
 * Kontrak IAK postpaid memakai commands inq-pasca / pay-pasca / status-pasca.
 * Nama field respons berbeda dari Digiflazz, karena itu normalisasi ini
 * sengaja menerima beberapa kandidat nama field. Verifikasi sandbox IAK masih
 * diperlukan sebelum dipakai produksi.
 */
@Injectable()
export class IakPascabayarAdapter implements PascabayarAdapter {
  readonly provider = 'IAK' as const;
  private readonly logger = new Logger(IakPascabayarAdapter.name);

  constructor(private readonly iak: IakService) {}

  async inquiry(input: PascabayarInquiryInput): Promise<PascabayarNormalizedInquiry> {
    try {
      const raw = await this.iak.transactionPascabayar({
        command: 'inq-pasca',
        refId: input.refId,
        sku: input.sku,
        customerNo: input.customerNo,
        additionalData: input.additionalData,
        providerType: input.providerType,
      });
      return this.normalizeInquiry(raw, input);
    } catch (error) {
      this.logger.error(`[IAK PASCA] Inquiry gagal: ${(error as Error).message}`);
      return this.ambiguousInquiry(input, 'Koneksi ke IAK gagal');
    }
  }

  async pay(input: PascabayarPayInput): Promise<PascabayarNormalizedPay> {
    try {
      const raw = await this.iak.transactionPascabayar({
        command: 'pay-pasca',
        refId: input.refId,
        sku: input.sku,
        customerNo: input.customerNo,
        additionalData: input.additionalData,
        providerType: input.providerType,
      });
      return this.normalizePay(raw);
    } catch (error) {
      this.logger.error(`[IAK PASCA] Pay gagal: ${(error as Error).message}`);
      return this.ambiguousPay('Koneksi ke IAK gagal setelah permintaan dikirim');
    }
  }

  async status(input: PascabayarPayInput): Promise<PascabayarNormalizedPay> {
    try {
      const raw = await this.iak.transactionPascabayar({
        command: 'status-pasca',
        refId: input.refId,
        sku: input.sku,
        customerNo: input.customerNo,
        additionalData: input.additionalData,
        providerType: input.providerType,
      });
      return this.normalizePay(raw);
    } catch (error) {
      this.logger.error(`[IAK PASCA] Status gagal: ${(error as Error).message}`);
      return this.ambiguousPay('Status tidak dapat dipastikan');
    }
  }

  private normalizeInquiry(raw: unknown, input: PascabayarInquiryInput): PascabayarNormalizedInquiry {
    const data = asRecord(asRecord(raw).data);
    const rc = String(pick(data, 'rc') ?? '');
    const statusCode = String(pick(data, 'status') ?? '');
    const statusText = statusFromText(pick(data, 'status_text', 'statusText'));
    const message = String(pick(data, 'message', 'keterangan') ?? '');
    const billAmount = toIntOrNull(pick(data, 'bill_amount', 'billAmount', 'price', 'nominal', 'total'));
    const ok = (rc === '00' || statusCode === '1' || statusCode === '00') && billAmount !== null;

    return {
      ok,
      status: ok ? 'sukses' : statusText ?? (statusCode === '0' ? 'pending' : 'tidak_diketahui'),
      rc,
      message,
      customerName: (pick(data, 'customer_name', 'customerName') as string | undefined) ?? null,
      customerNo: String(pick(data, 'customer_id', 'customer_no', 'customerNo') ?? input.customerNo),
      billAmount,
      providerAdminFee: toIntOrNull(pick(data, 'admin', 'admin_fee')),
      providerCommission: toIntOrNull(pick(data, 'komisi', 'commission')),
      providerSellingPrice: toIntOrNull(pick(data, 'selling_price', 'total')),
      period: (pick(data, 'periode', 'period', 'desc') as string | undefined) ?? null,
      detail: data,
      raw,
    };
  }

  private normalizePay(raw: unknown): PascabayarNormalizedPay {
    if (!raw) return this.ambiguousPay('Status tidak dapat dipastikan');
    const root = asRecord(raw);
    const data = asRecord(root.data ?? root);
    const rc = String(pick(data, 'rc') ?? '');
    const statusCode = String(pick(data, 'status') ?? '');
    const statusText = statusFromText(pick(data, 'status_text', 'statusText', 'status'));

    let status: PascabayarNormalizedPay['status'] = 'tidak_diketahui';
    if (statusText) status = statusText;
    else if (rc === '00') status = 'sukses';
    else if (statusCode === '0') status = 'pending';
    else if (statusCode === '2') status = 'gagal';

    return {
      status,
      definitiveFailure: status === 'gagal',
      rc,
      message: String(pick(data, 'message', 'keterangan') ?? ''),
      sn: (pick(data, 'sn', 'serial_number') as string | undefined) ?? null,
      providerRefId: (pick(data, 'tr_id', 'trId') as string | undefined) ?? null,
      actualBillAmount: toIntOrNull(pick(data, 'bill_amount', 'price', 'total')),
      actualProviderAdminFee: toIntOrNull(pick(data, 'admin', 'admin_fee')),
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
