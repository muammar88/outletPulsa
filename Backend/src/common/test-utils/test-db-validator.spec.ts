import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn(),
  };
});

import {
  validateAndGetTestDatabaseUrl,
  createTestPrismaClient,
  ALLOWED_TEST_DB_NAMES,
  ALLOWED_TEST_HOSTS,
} from './test-db-validator';

describe('T0: Test Database Isolation & TEST_DATABASE_URL Validator', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('T0-01: Gagal jika TEST_DATABASE_URL tidak disetel atau kosong, tanpa fallback ke DATABASE_URL', () => {
    delete process.env.TEST_DATABASE_URL;
    process.env.DATABASE_URL = 'postgresql://postgres:app_secret@localhost:5432/outletpulsa_db';

    expect(() => validateAndGetTestDatabaseUrl()).toThrow(
      /TEST_DATABASE_URL wajib disetel/,
    );
    expect(() => validateAndGetTestDatabaseUrl('')).toThrow(
      /TEST_DATABASE_URL wajib disetel/,
    );
  });

  it('T0-02: Menolak database aplikasi "outletpulsa_db" meskipun host adalah localhost', () => {
    const dangerousUrl = 'postgresql://postgres:secret_pass@localhost:5432/outletpulsa_db';

    expect(() => validateAndGetTestDatabaseUrl(dangerousUrl)).toThrow(
      /Dilarang menggunakan database aplikasi\/produksi.*outletpulsa_db/,
    );
  });

  it('T0-03: Menolak host yang tidak diizinkan / bukan test host eksplisit', () => {
    const remoteUrl = 'postgresql://postgres:secret_pass@db.production-server.com:5432/outletpulsa_c2_test';

    expect(() => validateAndGetTestDatabaseUrl(remoteUrl)).toThrow(
      /Host database tidak diizinkan/,
    );
  });

  it('T0-04: Masking kredensial: pesan error tidak boleh mencetak password pengguna', () => {
    const sensitivePassword = 'super_top_secret_password_xyz987';
    const badUrl = `postgresql://myuser:${sensitivePassword}@localhost:5432/outletpulsa_db`;

    try {
      validateAndGetTestDatabaseUrl(badUrl);
      fail('Harus throw error');
    } catch (err: any) {
      expect(err.message).not.toContain(sensitivePassword);
      expect(err.message).toContain('***');
    }
  });

  it('T0-05: Menolak nama database selain "outletpulsa_c2_test" atau pola test yang disetujui', () => {
    const invalidDbs = [
      'postgresql://postgres:pass@localhost:5432/postgres',
      'postgresql://postgres:pass@localhost:5432/template1',
      'postgresql://postgres:pass@localhost:5432/prod_app',
    ];

    for (const url of invalidDbs) {
      expect(() => validateAndGetTestDatabaseUrl(url)).toThrow(
        /Nama database uji tidak valid/,
      );
    }
  });

  it('T0-06: Menerima TEST_DATABASE_URL yang sah dengan host localhost dan DB outletpulsa_c2_test', () => {
    const validUrl = 'postgresql://postgres:pass@localhost:5432/outletpulsa_c2_test';

    const result = validateAndGetTestDatabaseUrl(validUrl);
    expect(result).toBe(validUrl);
  });

  it('T0-07: createTestPrismaClient menyuntikkan URL tervalidasi secara eksplisit ke PrismaClient', () => {
    const validUrl = 'postgresql://postgres:pass@localhost:5432/outletpulsa_c2_test';
    
    createTestPrismaClient(validUrl);
    
    // Verifikasi PrismaClient dipanggil dengan konfigurasi yang benar
    expect(PrismaClient).toHaveBeenCalledWith({
      datasources: {
        db: {
          url: validUrl,
        },
      },
    });
  });
});
