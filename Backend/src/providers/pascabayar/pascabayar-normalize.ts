import type { PascabayarNormalizedStatus } from './pascabayar.types';

/**
 * Ubah nilai apa pun menjadi integer rupiah; kembalikan null bila tidak valid.
 *
 * - String tanpa digit (mis. "abc") menjadi null, BUKAN 0.
 * - Nilai negatif ditolak (null).
 * - Pemisah ribuan Indonesia/umum ("100.000" / "100,000") dipahami.
 */
export function toIntOrNull(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value < 0) return null;
    return Math.trunc(value);
  }
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (!text) return null;
  if (text.includes("-")) return null;
  const numeric = text.replace(/[^0-9.,]/g, "");
  if (!/[0-9]/.test(numeric)) return null;

  let normalized = numeric;
  const hasDot = normalized.includes(".");
  const hasComma = normalized.includes(",");
  if (hasDot && hasComma) {
    // "1.000,50" -> 1000.50 (titik ribuan, koma desimal)
    normalized = normalized.replace(/\./g, "").replace(",", ".");
  } else if (hasComma) {
    const parts = normalized.split(",");
    normalized = parts.length === 2 && parts[1].length > 0 && parts[1].length <= 2
      ? parts[0] + "." + parts[1]
      : normalized.replace(/,/g, "");
  } else if (hasDot) {
    const parts = normalized.split(".");
    normalized = parts.length === 2 && parts[1].length > 0 && parts[1].length <= 2 && parts[0].length > 0
      ? normalized
      : normalized.replace(/\./g, "");
  }

  const n = Number(normalized);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.trunc(n);
}

/** Ambil field pertama yang ada dari daftar kandidat nama field. */
export function pick(obj: Record<string, unknown> | null | undefined, ...keys: string[]): unknown {
  if (!obj) return undefined;
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') return obj[key];
  }
  return undefined;
}

export function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

export function normalizeStatusText(value: unknown): string {
  return String(value ?? '').trim().toLowerCase();
}

/**
 * Terjemahkan teks status provider ke status internal.
 * Teks yang tidak dikenali menjadi `tidak_diketahui` (ambiguous).
 */
export function statusFromText(value: unknown): PascabayarNormalizedStatus | null {
  const text = normalizeStatusText(value);
  if (!text) return null;
  if (['sukses', 'success', 'berhasil', 'paid', 'lunas'].includes(text)) return 'sukses';
  if (['gagal', 'failed', 'fail', 'batal', 'dibatalkan', 'cancel', 'cancelled'].includes(text)) return 'gagal';
  if (['pending', 'proses', 'in progress', 'inprogress', 'menunggu', 'waiting'].includes(text)) return 'pending';
  return null;
}
/** Ubah nilai apa pun menjadi string; kembalikan null bila kosong. */
export function strOrNull(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'object') return null;
  const text = String(value).trim();
  return text ? text : null;
}

/**
 * Cari field pada objek utama dan sub-objek `detail`/`data`.
 * Sebagian respons provider menaruh referensi/keterangan di dalam objek bersarang.
 */
export function pickDeep(
  obj: Record<string, unknown> | null | undefined,
  ...keys: string[]
): unknown {
  const direct = pick(obj, ...keys);
  if (direct !== undefined) return direct;
  for (const nestedKey of ['detail', 'data']) {
    const nested = asRecord((obj ?? {})[nestedKey]);
    const found = pick(nested, ...keys);
    if (found !== undefined) return found;
  }
  return undefined;
}

/**
 * Hitung tagihan pelanggan dari rincian per lembar (`detail[]`):
 * `nilai_tagihan` + `denda`. Dipakai Digiflazz pasca pada `desc.detail`/`data.detail`.
 * Bila rincian tidak ada, kembalikan null (belum diketahui, bukan nol).
 */
export function sumDetailBill(container: unknown): number | null {
  const record = asRecord(container);
  const items = record.detail;
  if (!Array.isArray(items) || items.length === 0) return null;

  let total = 0;
  for (const item of items) {
    const row = asRecord(item);
    const nilai = toIntOrNull(row.nilai_tagihan);
    // Rincian malformed/tidak lengkap ditolak seluruhnya; jangan menjumlahkan
    // sebagian lembar lalu mengabaikan sisanya.
    if (nilai === null) return null;
    const hasDenda = row.denda !== null && row.denda !== undefined && row.denda !== '';
    const denda = hasDenda ? toIntOrNull(row.denda) : 0;
    if (denda === null) return null;
    total += nilai + denda;
  }
  return total;
}

/** Satu sinyal status dari respons provider (numerik/teks/kode). */
export type PascabayarStatusSignal = PascabayarNormalizedStatus | null;

/**
 * Gabungkan dua sinyal status (mis. numerik vs teks, atau kode vs teks) menjadi
 * satu status konsisten.
 *
 * - Kedua sinyal ada dan sama -> status tersebut.
 * - Kedua sinyal ada tetapi berbeda -> `tidak_diketahui` (rekonsiliasi).
 * - Hanya satu sinyal ada -> sinyal tersebut.
 * - Tidak ada sinyal -> `tidak_diketahui`.
 *
 * Sinyal kosong TIDAK boleh ditebak menjadi sukses/gagal.
 */
export function resolveConsistentStatus(
  first: PascabayarStatusSignal,
  second: PascabayarStatusSignal,
): PascabayarNormalizedStatus {
  if (first && second) return first === second ? first : 'tidak_diketahui';
  return first ?? second ?? 'tidak_diketahui';
}

export interface IdentitasPermintaan {
  refId?: string | null;
  sku?: string | null;
  customerNo?: string | null;
}

export interface IdentitasResponsSpec {
  ref: string[];
  sku: string[];
  customer: string[];
}

/**
 * Periksa identitas respons terhadap snapshot permintaan.
 *
 * Identitas dianggap cocok HANYA bila ketiga sinyal (referensi, SKU, nomor) ada
 * pada respons dan sama dengan permintaan. Field yang hilang bukan berarti
 * cocok: respons yang identitasnya belum dapat dipastikan harus masuk
 * rekonsiliasi, bukan dijadikan dasar pembayaran/finalisasi.
 *
 * @returns pesan ketidakcocokan, atau null bila identitas terkonfirmasi.
 */
export function periksaIdentitas(
  data: Record<string, unknown>,
  input: IdentitasPermintaan | null | undefined,
  spec: IdentitasResponsSpec,
): string | null {
  if (!input) return 'permintaan tidak memiliki snapshot identitas';
  const checks: Array<{ label: string; keys: string[]; expected: string | null }> = [
    { label: 'referensi', keys: spec.ref, expected: strOrNull(input.refId) },
    { label: 'SKU', keys: spec.sku, expected: strOrNull(input.sku) },
    { label: 'nomor', keys: spec.customer, expected: strOrNull(input.customerNo) },
  ];
  for (const check of checks) {
    if (!check.expected) return `${check.label}: snapshot permintaan kosong`;
    const got = strOrNull(pick(data, ...check.keys));
    if (!got) return `${check.label}: tidak ada pada respons`;
    if (got !== check.expected) return `${check.label}=${got} != ${check.expected}`;
  }
  return null;
}