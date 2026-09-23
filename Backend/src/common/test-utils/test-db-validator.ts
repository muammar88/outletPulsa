import { PrismaClient } from '@prisma/client';

export const ALLOWED_TEST_HOSTS = ['localhost', '127.0.0.1'];
export const ALLOWED_TEST_DB_NAMES = ['outletpulsa_c2_test'];
export const FORBIDDEN_DB_NAMES = ['outletpulsa_db', 'postgres', 'template1'];

/**
 * Menyembunyikan password dari connection string agar aman dicetak dalam error log
 */
export function maskDatabaseUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.password) {
      parsed.password = '***';
    }
    return parsed.toString();
  } catch {
    return '[MALFORMED_URL]';
  }
}

/**
 * Memvalidasi TEST_DATABASE_URL secara ketat sebelum PrismaClient dibuat atau migration dijalankan.
 * Menjamin:
 * 1. TEST_DATABASE_URL wajib ada dan tidak fallback ke DATABASE_URL aplikasi.
 * 2. Host wajib terdaftar di allowlist (localhost, 127.0.0.1).
 * 3. Database aplikasi 'outletpulsa_db' ditolak secara mutlak.
 * 4. Nama database wajib terdaftar pada whitelist test DB ('outletpulsa_c2_test' atau berpola *_test).
 * 5. Pesan error tidak membocorkan password pengguna.
 */
export function validateAndGetTestDatabaseUrl(explicitUrl?: string): string {
  const targetUrl = explicitUrl !== undefined ? explicitUrl : process.env.TEST_DATABASE_URL;

  if (!targetUrl || targetUrl.trim() === '') {
    throw new Error(
      'Configuration Error: TEST_DATABASE_URL wajib disetel untuk integration test (contoh: postgresql://user:pass@localhost:5432/outletpulsa_c2_test). Fallback ke DATABASE_URL aplikasi dilarang keras demi keamanan database.',
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(targetUrl);
  } catch (err: any) {
    throw new Error(
      `Configuration Error: Format TEST_DATABASE_URL tidak valid: ${err.message}`,
    );
  }

  const masked = maskDatabaseUrl(targetUrl);

  // 1. Validasi Protocol
  if (parsed.protocol !== 'postgresql:' && parsed.protocol !== 'postgres:') {
    throw new Error(
      `Configuration Error: Protokol database harus postgresql:// atau postgres://. Diterima: ${masked}`,
    );
  }

  // 2. Validasi Host
  const host = parsed.hostname;
  if (!ALLOWED_TEST_HOSTS.includes(host)) {
    throw new Error(
      `Configuration Error: Host database tidak diizinkan untuk integration test: "${host}". Hanya host lokal terisolasi yang diizinkan (${ALLOWED_TEST_HOSTS.join(', ')}). Target: ${masked}`,
    );
  }

  // 3. Ekstraksi dan Validasi Nama Database
  const pathname = parsed.pathname.replace(/^\//, '').trim();

  // Tolak DB aplikasi secara mutlak
  if (pathname.toLowerCase() === 'outletpulsa_db') {
    throw new Error(
      `Security Violation: Dilarang menggunakan database aplikasi/produksi "outletpulsa_db" untuk integration test! Target: ${masked}`,
    );
  }

  // Tolak default / generic DB names
  if (FORBIDDEN_DB_NAMES.includes(pathname.toLowerCase()) || !pathname) {
    throw new Error(
      `Configuration Error: Nama database uji tidak valid: "${pathname}". Dilarang menggunakan database bawaan (${FORBIDDEN_DB_NAMES.join(', ')}). Target: ${masked}`,
    );
  }

  // Validasi whitelist nama test DB
  const isExplicitAllowed = ALLOWED_TEST_DB_NAMES.includes(pathname.toLowerCase());
  const isTestPattern = pathname.toLowerCase().endsWith('_test');

  if (!isExplicitAllowed && !isTestPattern) {
    throw new Error(
      `Configuration Error: Nama database uji tidak valid: "${pathname}". Nama database harus berupa "outletpulsa_c2_test" atau berakhiran "_test". Target: ${masked}`,
    );
  }

  return targetUrl;
}

/**
 * Membuat PrismaClient terisolasi dengan datasource URL yang telah tervalidasi secara eksplisit.
 * Mencegah instansiasi PrismaClient default tersembunyi yang membaca DATABASE_URL aplikasi.
 */
export function createTestPrismaClient(validatedUrl?: string): PrismaClient {
  const safeUrl = validateAndGetTestDatabaseUrl(validatedUrl);
  return new PrismaClient({
    datasources: {
      db: {
        url: safeUrl,
      },
    },
  });
}
