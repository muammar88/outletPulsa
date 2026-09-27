import { Injectable, Logger } from '@nestjs/common';
import { DigiflazzService } from '../digiflazz.service';
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
  sumDetailBill,
  toIntOrNull,
} from './pascabayar-normalize';

/**
 * Adapter Digiflazz pascabayar.
 *
 * Kontrak: POST /v1/transaction dengan commands inq-pasca | pay-pasca | status-pasca,
 * signature MD5(username + apiKey + ref_id), respons dibungkus `data`.
 *
 * Catatan penting (docs resmi Digiflazz, diperiksa 27 September 2026):
 * - `price` = harga yang akan dipotong dari deposit BUYER (harga pokok kami), bukan tagihan pelanggan.
 * - `selling_price` = harga yang akan dipotong dari client (harga jual ke pelanggan).
 * - `admin` = total biaya admin; `commission` = komisi buyer.
 * - Tagihan pelanggan diambil dari `desc.detail[].nilai_tagihan + denda`; bila rincian
 *   tidak ada dipakai `selling_price - admin` (selling_price sudah termasuk admin).
 * Adapter tidak menebak; nilai yang tidak ada dikembalikan null.
 */
@Injectable()
export class DigiflazzPascabayarAdapter implements PascabayarAdapter {
  readonly provider = 'DIGIFLAZZ' as const;
  private readonly logger = new Logger(DigiflazzPascabayarAdapter.name);

  /** Field identitas respons Digiflazz yang wajib cocok dengan snapshot. */
  private static readonly IDENTITAS = {
    ref: ['ref_id'],
    sku: ['buyer_sku_code', 'sku'],
    customer: ['customer_no'],
  };

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
      return this.normalizePay(raw, 'Koneksi ke Digiflazz gagal setelah permintaan dikirim', input);
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
      return this.normalizePay(raw, 'Status tidak dapat dipastikan', input);
    } catch (error) {
      this.logger.error(`[DIGIFLAZZ PASCA] Status gagal: ${(error as Error).message}`);
      return this.ambiguousPay('Status tidak dapat dipastikan');
    }
  }

  private normalizeInquiry(raw: unknown, input: PascabayarInquiryInput): PascabayarNormalizedInquiry {
    const root = asRecord(raw);
    const data = asRecord(root.data ?? root);
    const rc = String(pick(data, 'rc') ?? '');
    const statusText = statusFromText(pick(data, 'status'));
    const admin = toIntOrNull(pick(data, 'admin'));
    const sellingPrice = toIntOrNull(pick(data, 'selling_price', 'sellingPrice'));
    const descRecord = asRecord(pick(data, 'desc'));
    const billAmount = this.resolveBillAmount(data, descRecord, admin, sellingPrice);
    const message = String(pick(data, 'message', 'keterangan') ?? strOrNull(pick(data, 'desc')) ?? '');
    const identitas = periksaIdentitas(data, input, DigiflazzPascabayarAdapter.IDENTITAS);
    if (identitas) {
      this.logger.warn(`[DIGIFLAZZ PASCA] Inquiry diabaikan, identitas tidak dapat dipastikan: ${identitas}`);
      return { ...this.ambiguousInquiry(input, `Identitas respons tidak dapat dipastikan: ${identitas}`), rc, raw };
    }

    const codeStatus: PascabayarNormalizedStatus | null =
      rc === '00' ? 'sukses' : rc === '03' ? 'pending' : null;
    const status = resolveConsistentStatus(codeStatus, statusText);
    const ok = status === 'sukses' && billAmount !== null;

    if (!ok) {
      this.logger.warn(`[DIGIFLAZZ PASCA] Inquiry tidak sukses rc=${rc} msg=${message}`);
    }

    return {
      ok,
      status,
      rc,
      message,
      customerName: strOrNull(pick(data, 'customer_name', 'customerName')),
      customerNo: String(pick(data, 'customer_no', 'customerNo') ?? input.customerNo),
      billAmount,
      providerCost: toIntOrNull(pick(data, 'price')),
      providerBillRef: strOrNull(pick(data, 'noref')),
      tarif: strOrNull(pick(descRecord, 'tarif')) ?? strOrNull(pick(data, 'tarif')),
      daya: toIntOrNull(pick(descRecord, 'daya') ?? pick(data, 'daya')),
      providerRefId: this.resolveProviderRef(data),
      providerAdminFee: admin,
      providerCommission: toIntOrNull(pick(data, 'commission', 'komisi')),
      providerSellingPrice: sellingPrice,
      period: strOrNull(pick(data, 'periode', 'period')) ?? strOrNull(pick(data, 'desc')),
      detail: data,
      raw,
    };
  }

  /**
   * Referensi provider: utamakan `tr_id` (termasuk bila hanya ada di objek `detail`),
   * lalu `ref_id` milik kita sebagai fallback supaya `noref` struk tidak kosong.
   */
  private resolveProviderRef(data: Record<string, unknown>): string | null {
    const nested = asRecord(data.detail);
    return (
      strOrNull(pick(data, 'tr_id', 'trId', 'reference_id')) ??
      strOrNull(pick(nested, 'tr_id', 'trId', 'reference_id', 'ref_id')) ??
      strOrNull(pick(data, 'ref_id'))
    );
  }

  /**
   * Tagihan pelanggan Digiflazz pasca (bukan `price`):
   * 1. Rincian per lembar `desc.detail[]` / `data.detail[]` = nilai_tagihan + denda.
   * 2. `selling_price - admin` bila rincian tidak ada (selling_price sudah termasuk admin).
   * Selain itu null supaya transaksi ditolak/ditahan, bukan memakai angka yang salah.
   */
  private resolveBillAmount(
    data: Record<string, unknown>,
    descRecord: Record<string, unknown>,
    admin: number | null,
    sellingPrice: number | null,
  ): number | null {
    const fromDetail = sumDetailBill(descRecord) ?? sumDetailBill(data);
    if (fromDetail !== null) return fromDetail;
    if (sellingPrice !== null && admin !== null) return sellingPrice - admin;
    return null;
  }

  private normalizePay(raw: unknown, ambiguousMessage: string, input?: PascabayarPayInput): PascabayarNormalizedPay {
    const root = asRecord(raw);
    const data = asRecord(root.data ?? root);
    const rc = String(pick(data, 'rc') ?? '');
    const statusText = statusFromText(pick(data, 'status'));

    if (!raw) {
      return this.ambiguousPay(ambiguousMessage);
    }

    // Identitas harus terkonfirmasi lengkap. Field yang hilang BUKAN berarti
    // cocok: respons tanpa identitas masuk rekonsiliasi.
    const identitas = periksaIdentitas(data, input, DigiflazzPascabayarAdapter.IDENTITAS);
    if (identitas) {
      this.logger.warn(`[DIGIFLAZZ PASCA] Hasil diabaikan, identitas tidak dapat dipastikan: ${identitas}`);
      return { ...this.ambiguousPay(`Identitas respons tidak dapat dipastikan: ${identitas}`), rc };
    }

    // Kode rc Digiflazz: 00 sukses, 03 pending, lainnya belum dapat dipastikan.
    const codeStatus: PascabayarNormalizedStatus | null =
      rc === '00' ? 'sukses' : rc === '03' ? 'pending' : null;
    // Teks status dan kode rc harus konsisten; jika berbeda/kosong -> rekonsiliasi.
    const status = resolveConsistentStatus(codeStatus, statusText);

    return {
      status,
      // Refund hanya boleh dilakukan bila HASIL GABUNGAN status benar-benar
      // gagal. Contoh rc=00 + status=Gagal adalah kontradiktif, sehingga
      // `status` menjadi tidak_diketahui dan tidak boleh memicu refund.
      definitiveFailure: status === 'gagal',
      rc,
      message: String(pick(data, 'message', 'keterangan') ?? strOrNull(pick(data, 'desc')) ?? ''),
      sn: strOrNull(pick(data, 'sn', 'serial_number')),
      providerRefId: this.resolveProviderRef(data),
      providerBillRef: strOrNull(pick(data, 'noref')),
      actualBillAmount: this.resolveBillAmount(
        data,
        asRecord(pick(data, 'desc')),
        toIntOrNull(pick(data, 'admin')),
        toIntOrNull(pick(data, 'selling_price', 'sellingPrice')),
      ),
      actualProviderAdminFee: toIntOrNull(pick(data, 'admin')),
      providerCost: toIntOrNull(pick(data, 'price')),
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
