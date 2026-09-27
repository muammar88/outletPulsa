import { DigiflazzPascabayarAdapter } from './digiflazz-pascabayar.adapter';

function makeAdapter(raw: unknown, opts: { reject?: boolean } = {}) {
  const digiflazz = {
    transactionPascabayar: opts.reject
      ? jest.fn().mockRejectedValue(new Error('timeout'))
      : jest.fn().mockResolvedValue(raw),
  } as any;
  return { adapter: new DigiflazzPascabayarAdapter(digiflazz), digiflazz };
}

describe('DigiflazzPascabayarAdapter', () => {
  it('inquiry rc 00 dengan status Pending tidak dianggap sukses', async () => {
    const { adapter } = makeAdapter({
      data: {
        rc: '00',
        status: 'Pending',
        ref_id: 'R-INQ-CONFLICT',
        buyer_sku_code: 'PLN',
        customer_no: '00123',
        selling_price: 10000,
        admin: 0,
      },
    });

    const res = await adapter.inquiry({ refId: 'R-INQ-CONFLICT', sku: 'PLN', customerNo: '00123' });

    expect(res.ok).toBe(false);
    expect(res.status).toBe('tidak_diketahui');
  });

  it('status Gagal yang bertentangan dengan rc 00 tidak memicu refund', async () => {
    const { adapter } = makeAdapter({
      data: {
        rc: '00',
        status: 'Gagal',
        ref_id: 'R-CONFLICT',
        buyer_sku_code: 'PLN',
        customer_no: '00123',
      },
    });

    const res = await adapter.status({ refId: 'R-CONFLICT', sku: 'PLN', customerNo: '00123' });

    expect(res.status).toBe('tidak_diketahui');
    expect(res.definitiveFailure).toBe(false);
  });

  it('mengambil tagihan pelanggan dari rincian lembar, bukan dari price (potongan deposit)', async () => {
    const { adapter, digiflazz } = makeAdapter({
      data: {
        rc: '00',
        ref_id: 'R1',
        buyer_sku_code: 'SKU-PLN',
        customer_no: '530000000001',
        customer_name: 'BUDI',
        admin: 2500,
        price: 10000,
        selling_price: 11000,
        commission: 500,
        periode: '201901',
        desc: {
          tarif: 'R1',
          daya: 1300,
          lembar_tagihan: 1,
          detail: [{ periode: '201901', nilai_tagihan: '8000', admin: '2500', denda: '500' }],
        },
      },
    });

    const res = await adapter.inquiry({ refId: 'R1', sku: 'SKU-PLN', customerNo: '530000000001' });

    expect(digiflazz.transactionPascabayar).toHaveBeenCalledWith(
      expect.objectContaining({ command: 'inq-pasca', sku: 'SKU-PLN', refId: 'R1' }),
    );
    expect(res.ok).toBe(true);
    // 8000 nilai tagihan + 500 denda; price (10000) BUKAN tagihan.
    expect(res.billAmount).toBe(8500);
    expect(res.providerCost).toBe(10000);
    expect(res.providerSellingPrice).toBe(11000);
    expect(res.providerAdminFee).toBe(2500);
    expect(res.providerCommission).toBe(500);
    expect(res.tarif).toBe('R1');
    expect(res.daya).toBe(1300);
    expect(res.customerName).toBe('BUDI');
    // Tidak ada tr_id pada respons; fallback memakai ref_id milik kami.
    expect(res.providerRefId).toBe('R1');
  });

  it('memakai selling_price - admin bila rincian lembar tidak ada', async () => {
    const { adapter } = makeAdapter({
      data: { rc: '00', ref_id: 'R1B', buyer_sku_code: 'PDAM', admin: 2000, selling_price: 102000, price: 99000, customer_no: '1' },
    });
    const res = await adapter.inquiry({ refId: 'R1B', sku: 'PDAM', customerNo: '1' });
    expect(res.ok).toBe(true);
    expect(res.billAmount).toBe(100000);
  });

  it('menolak inquiry bila tagihan tidak dapat dipastikan (price bukan tagihan)', async () => {
    const { adapter } = makeAdapter({ data: { rc: '00', price: 10000, admin: 2500 } });
    const res = await adapter.inquiry({ refId: 'R1C', sku: 'X', customerNo: '1' });
    expect(res.ok).toBe(false);
    expect(res.billAmount).toBeNull();
  });

  it('mempertahankan nilai fee nol sebagai nol, bukan null/default', async () => {
    const { adapter } = makeAdapter({ data: { rc: '00', ref_id: 'R2', buyer_sku_code: 'X', customer_no: '1', admin: 0, selling_price: 10000, price: 9000 } });
    const res = await adapter.inquiry({ refId: 'R2', sku: 'X', customerNo: '1' });
    expect(res.providerAdminFee).toBe(0);
    expect(res.providerCommission).toBeNull();
    expect(res.billAmount).toBe(10000);
  });

  it('menganggap rc 03 sebagai pending, bukan gagal', async () => {
    const { adapter } = makeAdapter({ data: { rc: '03', status: 'Pending', ref_id: 'R3', buyer_sku_code: 'X', customer_no: '1', price: 5000 } });
    const res = await adapter.inquiry({ refId: 'R3', sku: 'X', customerNo: '1' });
    expect(res.ok).toBe(false);
    expect(res.status).toBe('pending');
  });

  it('rc tidak dikenal tanpa teks status menjadi ambigu (tidak definitif gagal)', async () => {
    const { adapter } = makeAdapter({ data: { rc: '99', ref_id: 'R4', buyer_sku_code: 'X', customer_no: '1', price: 5000 } });
    const res = await adapter.status({ refId: 'R4', sku: 'X', customerNo: '1' });
    expect(res.status).toBe('tidak_diketahui');
    expect(res.definitiveFailure).toBe(false);
  });

  it('teks status gagal menjadi kegagalan definitif', async () => {
    const { adapter } = makeAdapter({ data: { rc: '14', status: 'Gagal', message: 'Tagihan sudah dibayar', ref_id: 'R5', buyer_sku_code: 'X', customer_no: '1' } });
    const res = await adapter.pay({ refId: 'R5', sku: 'X', customerNo: '1' });
    expect(res.status).toBe('gagal');
    expect(res.definitiveFailure).toBe(true);
  });

  it('pembayaran sukses mengambil sn dan tagihan aktual, bukan price', async () => {
    const { adapter } = makeAdapter({
      data: {
        rc: '00',
        status: 'Sukses',
        sn: 'S1234554321N',
        ref_id: 'R5B',
        buyer_sku_code: 'X',
        customer_no: '1',
        admin: 2500,
        price: 10000,
        selling_price: 11000,
        desc: { detail: [{ nilai_tagihan: '8000', denda: '500' }] },
      },
    });
    const res = await adapter.pay({ refId: 'R5B', sku: 'X', customerNo: '1' });
    expect(res.status).toBe('sukses');
    expect(res.sn).toBe('S1234554321N');
    expect(res.actualBillAmount).toBe(8500);
    expect(res.providerCost).toBe(10000);
    expect(res.providerRefId).toBe('R5B');
  });

  it('kegagalan koneksi tidak dianggap gagal definitif', async () => {
    const { adapter } = makeAdapter(null, { reject: true });
    const res = await adapter.pay({ refId: 'R6', sku: 'X', customerNo: '1' });
    expect(res.status).toBe('tidak_diketahui');
    expect(res.definitiveFailure).toBe(false);
  });

  it('respons dengan identitas berbeda masuk rekonsiliasi, bukan sukses', async () => {
    const { adapter } = makeAdapter({
      data: { rc: '00', status: 'Sukses', ref_id: 'LAIN', customer_no: '999' },
    });
    const res = await adapter.status({ refId: 'R7', sku: 'X', customerNo: '1' });
    expect(res.status).toBe('tidak_diketahui');
    expect(res.definitiveFailure).toBe(false);
  });
});
