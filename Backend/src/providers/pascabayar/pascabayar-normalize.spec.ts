import { periksaIdentitas, resolveConsistentStatus, sumDetailBill, toIntOrNull } from './pascabayar-normalize';

describe('pascabayar-normalize', () => {
  describe('toIntOrNull', () => {
    it('menolak nilai non-numerik sebagai null, bukan nol', () => {
      expect(toIntOrNull('abc')).toBeNull();
      expect(toIntOrNull('')).toBeNull();
      expect(toIntOrNull(null)).toBeNull();
      expect(toIntOrNull(undefined)).toBeNull();
      expect(toIntOrNull({})).toBeNull();
    });

    it('menolak nilai negatif dan non-finite', () => {
      expect(toIntOrNull(-5)).toBeNull();
      expect(toIntOrNull('-5')).toBeNull();
      expect(toIntOrNull(Number.POSITIVE_INFINITY)).toBeNull();
      expect(toIntOrNull(Number.NaN)).toBeNull();
    });

    it('memahami pemisah ribuan umum', () => {
      expect(toIntOrNull('100.000')).toBe(100000);
      expect(toIntOrNull('100,000')).toBe(100000);
      expect(toIntOrNull('1.000.000')).toBe(1000000);
    });

    it('mempertahankan nol sebagai nol', () => {
      expect(toIntOrNull(0)).toBe(0);
      expect(toIntOrNull('0')).toBe(0);
    });
  });

  describe('sumDetailBill', () => {
    it('menjumlahkan nilai_tagihan + denda tiap lembar', () => {
      expect(
        sumDetailBill({ detail: [{ nilai_tagihan: '8000', denda: '500' }, { nilai_tagihan: 1000 }] }),
      ).toBe(9500);
    });

    it('menolak seluruh rincian bila ada lembar malformed', () => {
      expect(sumDetailBill({ detail: [{ nilai_tagihan: '8000' }, { nilai_tagihan: 'abc' }] })).toBeNull();
      expect(sumDetailBill({ detail: [{ nilai_tagihan: '8000', denda: 'abc' }] })).toBeNull();
    });

    it('mengembalikan null bila rincian tidak ada', () => {
      expect(sumDetailBill({})).toBeNull();
      expect(sumDetailBill({ detail: [] })).toBeNull();
    });
  });
});

describe('resolveConsistentStatus', () => {
  it('mengembalikan status yang sama bila sinyal konsisten', () => {
    expect(resolveConsistentStatus('sukses', 'sukses')).toBe('sukses');
    expect(resolveConsistentStatus('gagal', 'gagal')).toBe('gagal');
  });

  it('mengembalikan tidak_diketahui bila sinyal bertentangan', () => {
    expect(resolveConsistentStatus('gagal', 'sukses')).toBe('tidak_diketahui');
    expect(resolveConsistentStatus('sukses', 'pending')).toBe('tidak_diketahui');
  });

  it('tidak menebak sukses saat salah satu sinyal kosong', () => {
    expect(resolveConsistentStatus(null, null)).toBe('tidak_diketahui');
    expect(resolveConsistentStatus('pending', null)).toBe('pending');
  });
});

describe('periksaIdentitas', () => {
  const spec = { ref: ['ref_id'], sku: ['code'], customer: ['hp'] };
  const input = { refId: 'A', sku: 'X', customerNo: '1' };

  it('mengembalikan null bila identitas lengkap dan cocok', () => {
    expect(periksaIdentitas({ ref_id: 'A', code: 'X', hp: '1' }, input, spec)).toBeNull();
  });

  it('menolak identitas yang tidak lengkap maupun berbeda', () => {
    expect(periksaIdentitas({ ref_id: 'A', code: 'X' }, input, spec)).toContain('nomor');
    expect(periksaIdentitas({ ref_id: 'A', code: 'X', hp: '2' }, input, spec)).toContain('nomor');
  });

  it('menolak bila snapshot permintaan kosong', () => {
    expect(periksaIdentitas({ ref_id: 'A', code: 'X', hp: '1' }, { ...input, refId: '' }, spec)).toContain('referensi');
  });
});