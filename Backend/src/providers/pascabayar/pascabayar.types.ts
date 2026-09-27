/**
 * Kontrak adapter pascabayar multi-provider.
 *
 * Provider dipilih admin per produk internal (lihat ProdukPascabayarProvider).
 * Adapter hanya bertanggung jawab menerjemahkan kontrak provider ke bentuk
 * internal yang sama. Adapter TIDAK boleh menyentuh saldo, ledger, atau status
 * transaksi internal.
 */

export type PascabayarProviderCode = 'IAK' | 'DIGIFLAZZ';

/**
 * Status internal hasil normalisasi.
 *
 * `tidak_diketahui` dipakai ketika respons provider hilang/kontradiktif.
 * Status ini TIDAK boleh diperlakukan sebagai gagal/refund otomatis.
 */
export type PascabayarNormalizedStatus = 'sukses' | 'gagal' | 'pending' | 'tidak_diketahui';

export interface PascabayarInquiryInput {
  /** Referensi unik milik kami; dipakai juga oleh provider. */
  refId: string;
  /** SKU provider hasil pemetaan admin (bukan kode produk internal). */
  sku: string;
  /** Nomor pelanggan, disimpan sebagai string. */
  customerNo: string;
  /** Input tambahan khusus produk (mis. kode kabupaten PBB). */
  additionalData?: Record<string, unknown> | null;
  /** Tipe/kategori provider (dipakai IAK untuk membentuk URL bill/check). */
  providerType?: string | null;
}

export interface PascabayarPayInput {
  refId: string;
  sku: string;
  customerNo: string;
  additionalData?: Record<string, unknown> | null;
  providerType?: string | null;
  /** Referensi internal provider (mis. `tr_id` IAK hasil inquiry) bila kontraknya memerlukan. */
  providerRefId?: string | null;
}

export interface PascabayarNormalizedInquiry {
  /** true bila inquiry berhasil dan tagihan teridentifikasi. */
  ok: boolean;
  status: PascabayarNormalizedStatus;
  rc: string;
  message: string;
  customerName: string | null;
  customerNo: string;
  /**
   * Nominal tagihan pelanggan dari provider (bukan harga jual aplikasi).
   * Untuk Digiflazz: `detail[].nilai_tagihan + denda`, atau `selling_price - admin`.
   * `price` BUKAN tagihan: `price` adalah potongan deposit buyer.
   */
  billAmount: number | null;
  /**
   * Harga pokok yang dipotong dari deposit/saldo kami bila provider menyatakannya.
   * Digiflazz: `price`. IAK: tidak dinyatakan pada respons (`null`, bukan nol).
   */
  providerCost: number | null;
  /** Tarif/daya (PLN) bila provider menyatakannya. */
  tarif: string | null;
  daya: number | null;
  /** `tr_id` provider (ID inquiry IAK) bila ada; dipakai pembayaran IAK. */
  providerRefId: string | null;
  /** Referensi biller/nomor bukti provider (mis. `noref` IAK), terpisah dari ID inquiry. */
  providerBillRef: string | null;
  /** Biaya admin yang dikenakan provider. null = belum diketahui (bukan 0). */
  providerAdminFee: number | null;
  /** Komisi dari provider bila dinyatakan terpisah. null = belum diketahui. */
  providerCommission: number | null;
  /** Total yang dibayarkan buyer ke provider bila provider menyatakannya. */
  providerSellingPrice: number | null;
  period: string | null;
  detail: Record<string, unknown>;
  raw: unknown;
}

export interface PascabayarNormalizedPay {
  status: PascabayarNormalizedStatus;
  /**
   * true hanya bila provider memberi sinyal kegagalan eksplisit.
   * Ambigu/timeout/RC tak dikenal harus false agar tidak memicu refund otomatis.
   */
  definitiveFailure: boolean;
  rc: string;
  message: string;
  sn: string | null;
  providerRefId: string | null;
  /** Nominal tagihan aktual (bukan `price` potongan deposit) bila dinyatakan provider. */
  actualBillAmount: number | null;
  actualProviderAdminFee: number | null;
  /** Harga pokok yang dipotong dari deposit kami bila dinyatakan provider. */
  providerCost: number | null;
  /** Referensi biller/nomor bukti provider (mis. `noref` IAK), terpisah dari ID inquiry. */
  providerBillRef: string | null;
  raw: unknown;
}

export interface PascabayarAdapter {
  readonly provider: PascabayarProviderCode;
  inquiry(input: PascabayarInquiryInput): Promise<PascabayarNormalizedInquiry>;
  pay(input: PascabayarPayInput): Promise<PascabayarNormalizedPay>;
  status(input: PascabayarPayInput): Promise<PascabayarNormalizedPay>;
}
