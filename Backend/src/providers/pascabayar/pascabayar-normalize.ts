import type { PascabayarNormalizedStatus } from './pascabayar.types';

/** Ubah nilai apa pun menjadi integer; kembalikan null bila tidak valid. */
export function toIntOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(String(value).replace(/[^0-9.-]/g, ''));
  if (!Number.isFinite(n)) return null;
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

