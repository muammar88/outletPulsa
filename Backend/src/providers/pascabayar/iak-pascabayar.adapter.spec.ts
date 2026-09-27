import { IakPascabayarAdapter } from './iak-pascabayar.adapter';

function makeAdapter(raw: unknown, opts: { reject?: boolean } = {}) {
  const iak = {
    transactionPascabayar: opts.reject
      ? jest.fn().mockRejectedValue(new Error('timeout'))
      : jest.fn().mockResolvedValue(raw),
  } as any;
  return { adapter: new IakPascabayarAdapter(iak), iak };
}

describe('IakPascabayarAdapter', () => {
  it('meneruskan tr_id hasil inquiry ke service saat pembayaran', async () => {
    const { adapter, iak } = makeAdapter({ data: { response_code: '00', status: 1 } });
    await adapter.pay({
      refId: 'PSC900005',
      sku: 'PLNPOSTPAID',
      customerNo: '001234567890',
      providerRefId: '900005',
    });
    expect(iak.transactionPascabayar).toHaveBeenCalledWith(
      expect.objectContaining({ command: 'pay-pasca', trId: '900005' }),
    );
  });

  it('status sukses tanpa bill_amount tetap sukses bila identitas cocok', async () => {
    const { adapter } = makeAdapter({
      data: {
        response_code: '00',
        status: 1,
        ref_id: 'PSC900001',
        code: 'PLNPOSTPAID',
        hp: '001234567890',
        nominal: 100000,
        selling_price: 101500,
      },
    });
    const res = await adapter.status({ refId: 'PSC900001', sku: 'PLNPOSTPAID', customerNo: '001234567890' });
    expect(res.status).toBe('sukses');
    expect(res.providerCost).toBe(101500);
  });

  it('status numerik 0 tidak menjadi sukses walau response_code 00', async () => {
    const { adapter } = makeAdapter({ data: { response_code: '00', status: 0, ref_id: 'PSC900002', code: 'PLNPOSTPAID', hp: '001234567890' } });
    const res = await adapter.status({ refId: 'PSC900002', sku: 'PLNPOSTPAID', customerNo: '001234567890' });
    expect(res.status).toBe('tidak_diketahui');
    expect(res.definitiveFailure).toBe(false);
  });

  it('status numerik 0 tetap tidak diketahui walau teks menyatakan sukses', async () => {
    const { adapter } = makeAdapter({
      data: {
        response_code: '00',
        status: 0,
        status_text: 'Sukses',
        ref_id: 'PSC900012',
        code: 'PLNPOSTPAID',
        hp: '001234567890',
      },
    });
    const res = await adapter.status({ refId: 'PSC900012', sku: 'PLNPOSTPAID', customerNo: '001234567890' });
    expect(res.status).toBe('tidak_diketahui');
    expect(res.definitiveFailure).toBe(false);
  });

  it('respons dengan ref_id berbeda masuk rekonsiliasi, bukan sukses', async () => {
    const { adapter } = makeAdapter({ data: { response_code: '00', status: 1, ref_id: 'PSC-LAIN' } });
    const res = await adapter.status({ refId: 'PSC900003', sku: 'PLNPOSTPAID', customerNo: '001234567890' });
    expect(res.status).toBe('tidak_diketahui');
    expect(res.definitiveFailure).toBe(false);
  });

  it('status 2 dengan identitas berbeda tidak dianggap gagal definitif', async () => {
    const { adapter } = makeAdapter({ data: { response_code: '00', status: 2, hp: '999' } });
    const res = await adapter.status({ refId: 'PSC900004', sku: 'PLNPOSTPAID', customerNo: '001234567890' });
    expect(res.status).toBe('tidak_diketahui');
    expect(res.definitiveFailure).toBe(false);
  });

  it('kegagalan koneksi status tidak dianggap gagal definitif', async () => {
    const { adapter } = makeAdapter(null, { reject: true });
    const res = await adapter.status({ refId: 'PSC900006', sku: 'PLNPOSTPAID', customerNo: '001234567890' });
    expect(res.status).toBe('tidak_diketahui');
    expect(res.definitiveFailure).toBe(false);
  });

  it('status numerik 2 dengan teks sukses yang bertentangan tidak dianggap sukses', async () => {
    const { adapter } = makeAdapter({
      data: {
        response_code: '00',
        status: 2,
        status_text: 'Sukses',
        ref_id: 'PSC900008',
        code: 'PLNPOSTPAID',
        hp: '001234567890',
      },
    });
    const res = await adapter.status({ refId: 'PSC900008', sku: 'PLNPOSTPAID', customerNo: '001234567890' });
    expect(res.status).toBe('tidak_diketahui');
    expect(res.definitiveFailure).toBe(false);
  });

  it('status kosong walau response_code 00 tidak dianggap sukses', async () => {
    const { adapter } = makeAdapter({
      data: { response_code: '00', ref_id: 'PSC900009', code: 'PLNPOSTPAID', hp: '001234567890' },
    });
    const res = await adapter.status({ refId: 'PSC900009', sku: 'PLNPOSTPAID', customerNo: '001234567890' });
    expect(res.status).toBe('tidak_diketahui');
    expect(res.definitiveFailure).toBe(false);
  });

  it('identitas respons status yang tidak lengkap tidak dianggap sukses', async () => {
    const { adapter } = makeAdapter({
      data: { response_code: '00', status: 1, ref_id: 'PSC900010', code: 'PLNPOSTPAID' },
    });
    const res = await adapter.status({ refId: 'PSC900010', sku: 'PLNPOSTPAID', customerNo: '001234567890' });
    expect(res.status).toBe('tidak_diketahui');
    expect(res.definitiveFailure).toBe(false);
  });

  it('inquiry dengan identitas tidak lengkap tidak dianggap sukses', async () => {
    const { adapter } = makeAdapter({
      data: { response_code: '00', status: 1, nominal: 100000, ref_id: 'PSC900011', code: 'PLNPOSTPAID' },
    });
    const res = await adapter.inquiry({ refId: 'PSC900011', sku: 'PLNPOSTPAID', customerNo: '001234567890' });
    expect(res.ok).toBe(false);
    expect(res.status).toBe('tidak_diketahui');
  });
});
