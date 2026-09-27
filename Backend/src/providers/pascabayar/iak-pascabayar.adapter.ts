import { Injectable, Logger } from '@nestjs/common';
import { IakService } from '../iak.service';
import {
  PascabayarAdapter,
  PascabayarInquiryInput,
  PascabayarNormalizedInquiry,
  PascabayarNormalizedPay,
  PascabayarNormalizedStatus,
  PascabayarPayInput,
} from './pascabayar.types';
import {
  asRecord,
  periksaIdentitas,
  pick,
  resolveConsistentStatus,
  statusFromText,
  strOrNull,
  toIntOrNull,
} from './pascabayar-normalize';

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

  /** Field identitas respons IAK yang wajib cocok dengan snapshot. */
  private static readonly IDENTITAS = {
    ref: ['ref_id'],
    sku: ['code', 'product_code'],
    customer: ['hp', 'customer_no'],
  };

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
        trId: strOrNull(input.providerRefId),
        sku: input.sku,
        customerNo: input.customerNo,
        additionalData: input.additionalData,
        providerType: input.providerType,
      });
      return this.normalizePay(raw, input);
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
        trId: strOrNull(input.providerRefId),
        sku: input.sku,
        customerNo: input.customerNo,
        additionalData: input.additionalData,
        providerType: input.providerType,
      });
      return this.normalizePay(raw, input);
    } catch (error) {
      this.logger.error(`[IAK PASCA] Status gagal: ${(error as Error).message}`);
      return this.ambiguousPay('Status tidak dapat dipastikan');
    }
  }

  private normalizeInquiry(raw: unknown, input: PascabayarInquiryInput): PascabayarNormalizedInquiry {
    const root = asRecord(raw);
    const data = asRecord(root.data ?? root);
    const rc = String(pick(data, 'response_code', 'rc') ?? '');
    const statusNum = toIntOrNull(pick(data, 'status'));
    const statusText = statusFromText(pick(data, 'status_text', 'statusText'));
    const desc = asRecord(pick(data, 'desc'));
    const message = String(pick(data, 'message', 'keterangan') ?? strOrNull(pick(data, 'desc')) ?? '');
    // Tagihan pelanggan IAK = nominal. `price` = nominal + admin, bukan tagihan mentah.
    const billAmount = toIntOrNull(pick(data, 'nominal'));
    const sellingPrice = toIntOrNull(pick(data, 'selling_price'));
    const identitas = periksaIdentitas(data, input, IakPascabayarAdapter.IDENTITAS);
    if (identitas) {
      this.logger.warn(`[IAK PASCA] Inquiry diabaikan, identitas tidak dapat dipastikan: ${identitas}`);
      return { ...this.ambiguousInquiry(input, `Identitas respons tidak dapat dipastikan: ${identitas}`), rc, raw };
    }

    const ok =
      rc === '00' &&
      billAmount !== null &&
      (statusText === null || statusText === 'sukses') &&
      (statusNum === null || statusNum === 1 || statusNum === 0);

    return {
      ok,
      status: ok ? 'sukses' : statusText ?? (statusNum === 3 ? 'pending' : 'tidak_diketahui'),
      rc,
      message,
      customerName: strOrNull(pick(data, 'tr_name', 'customer_name', 'customerName')),
      // Nomor pelanggan dipertahankan apa adanya (nol di depan tidak dihapus).
      customerNo: strOrNull(pick(data, 'hp', 'customer_id', 'customer_no', 'customerNo')) ?? input.customerNo,
      billAmount,
      // Biaya deposit IAK dinyatakan pada selling_price (potongan saldo sesudah komisi).
      providerCost: sellingPrice,
      tarif: strOrNull(pick(desc, 'tarif')) ?? strOrNull(pick(data, 'tarif')),
      daya: toIntOrNull(pick(desc, 'daya') ?? pick(data, 'daya')),
      providerRefId: strOrNull(pick(data, 'tr_id', 'trId')),
      providerBillRef: strOrNull(pick(data, 'noref')),
      providerAdminFee: toIntOrNull(pick(data, 'admin', 'admin_fee')),
      providerCommission: toIntOrNull(pick(data, 'komisi', 'commission')),
      providerSellingPrice: sellingPrice,
      period: strOrNull(pick(data, 'period', 'periode')),
      detail: data,
      raw,
    };
  }

  private normalizePay(raw: unknown, input?: PascabayarPayInput): PascabayarNormalizedPay {
    if (!raw) return this.ambiguousPay('Status tidak dapat dipastikan');
    const root = asRecord(raw);
    const data = asRecord(root.data ?? root);
    const rc = String(pick(data, 'response_code', 'rc') ?? '');
    const statusNum = toIntOrNull(pick(data, 'status'));
    const statusText = statusFromText(pick(data, 'status_text', 'statusText', 'status'));
    const sellingPrice = toIntOrNull(pick(data, 'selling_price'));

    // Identitas harus terkonfirmasi lengkap. Field yang hilang BUKAN berarti
    // cocok: respons tanpa identitas masuk rekonsiliasi.
    const identitas = periksaIdentitas(data, input, IakPascabayarAdapter.IDENTITAS);
    if (identitas) {
      this.logger.warn(`[IAK PASCA] Hasil diabaikan, identitas tidak dapat dipastikan: ${identitas}`);
      return { ...this.ambiguousPay(`Identitas respons tidak dapat dipastikan: ${identitas}`), rc };
    }

    // Status numerik IAK: 1 sukses, 2 gagal, 3 pending, 0/asing belum dapat dipastikan.
    const numericStatus: PascabayarNormalizedStatus | null =
      statusNum === 1
        ? 'sukses'
        : statusNum === 2
          ? 'gagal'
          : statusNum === 3
            ? 'pending'
            : statusNum === 0
              ? 'tidak_diketahui'
              : null;
    // Sinyal numerik dan teks harus konsisten; sinyal kosong/bertentangan tidak
    // ditebak menjadi sukses. RC saja (tanpa status eksplisit) juga tidak cukup.
    const status = resolveConsistentStatus(numericStatus, statusText);
    const definitiveFailure = status === 'gagal';

    return {
      status,
      definitiveFailure,
      rc,
      message: String(pick(data, 'message', 'keterangan') ?? strOrNull(pick(data, 'desc')) ?? ''),
      sn: strOrNull(pick(data, 'sn', 'serial_number')),
      providerRefId: strOrNull(pick(data, 'tr_id', 'trId')),
      providerBillRef: strOrNull(pick(data, 'noref')),
      actualBillAmount: toIntOrNull(pick(data, 'nominal', 'bill_amount')),
      actualProviderAdminFee: toIntOrNull(pick(data, 'admin', 'admin_fee')),
      providerCost: sellingPrice,
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
      providerCost: null,
      tarif: null,
      daya: null,
      providerRefId: null,
      providerBillRef: null,
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
      providerBillRef: null,
      actualBillAmount: null,
      actualProviderAdminFee: null,
      providerCost: null,
      raw: null,
    };
  }
}
