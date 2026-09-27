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
  it('menormalkan inquiry sukses dan memakai price sebagai nominal tagihan', async () => {
    const { adapter, digiflazz } = makeAdapter({
      data: {
        rc: '00',
        customer_no: '12345',
        customer_name: 'BUDI',
        price: 123456,
        admin: 2500,
        commission: 500,
        selling_price: 125956,
        desc: 'TAGIHAN LISTRIK',
      },
    });

    const res = await adapter.inquiry({ refId: 'R1', sku: 'SKU-PLN', customerNo: '12345' });

    expect(digiflazz.transactionPascabayar).toHaveBeenCalledWith(
      expect.objectContaining({ command: 'inq-pasca', sku: 'SKU-PLN', refId: 'R1' }),
    );
    expect(res.ok).toBe(true);
    expect(res.billAmount).toBe(123456);
    expect(res.providerAdminFee).toBe(2500);
    expect(res.providerCommission).toBe(500);
    expect(res.providerSellingPrice).toBe(125956);
    expect(res.customerName).toBe('BUDI');
  });

  it('mempertahankan nilai fee nol sebagai nol, bukan null/default', async () => {
    const { adapter } = makeAdapter({ data: { rc: '00', price: 10000, admin: 0, commission: 0 } });
    const res = await adapter.inquiry({ refId: 'R2', sku: 'X', customerNo: '1' });
    expect(res.providerAdminFee).toBe(0);
    expect(res.providerCommission).toBe(0);
  });

  it('menganggap rc 03 sebagai pending, bukan gagal', async () => {
    const { adapter } = makeAdapter({ data: { rc: '03', status: 'Pending', price: 5000 } });
    const res = await adapter.inquiry({ refId: 'R3', sku: 'X', customerNo: '1' });
    expect(res.ok).toBe(false);
    expect(res.status).toBe('pending');
  });

  it('rc tidak dikenal tanpa teks status menjadi ambigu (tidak definitif gagal)', async () => {
    const { adapter } = makeAdapter({ data: { rc: '99', price: 5000 } });
    const res = await adapter.status({ refId: 'R4', sku: 'X', customerNo: '1' });
    expect(res.status).toBe('tidak_diketahui');
    expect(res.definitiveFailure).toBe(false);
  });

  it('teks status gagal menjadi kegagalan definitif', async () => {
    const { adapter } = makeAdapter({ data: { rc: '14', status: 'Gagal', message: 'Tagihan sudah dibayar' } });
    const res = await adapter.pay({ refId: 'R5', sku: 'X', customerNo: '1' });
    expect(res.status).toBe('gagal');
    expect(res.definitiveFailure).toBe(true);
  });

  it('kegagalan koneksi tidak dianggap gagal definitif', async () => {
    const { adapter } = makeAdapter(null, { reject: true });
    const res = await adapter.pay({ refId: 'R6', sku: 'X', customerNo: '1' });
    expect(res.status).toBe('tidak_diketahui');
    expect(res.definitiveFailure).toBe(false);
  });
});

