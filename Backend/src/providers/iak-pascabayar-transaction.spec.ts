import * as crypto from 'crypto';
import { IakService } from './iak.service';

const md5 = (value: string) => crypto.createHash('md5').update(value).digest('hex');
const USER = '000000012345';

describe('IakService.transactionPascabayar', () => {
  const originalFetch = (global as any).fetch;

  beforeEach(() => {
    process.env.IAK_USERNAME = '12345';
    process.env.IAK_MODE = 'development';
    process.env.IAK_KEY_DEVELOPMENT = 'secretkey';
  });

  afterEach(() => {
    (global as any).fetch = originalFetch;
  });

  it('pembayaran memakai tr_id, sign(tr_id), endpoint tanpa kategori, dan tanpa ref_id/code/hp', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      text: async () => JSON.stringify({ data: { response_code: '00', status: 1, tr_id: '900001' } }),
    });
    (global as any).fetch = fetchMock;
    const service = new IakService();

    await service.transactionPascabayar({
      command: 'pay-pasca',
      refId: 'PSC900001',
      trId: '900001',
      sku: 'PLNPOSTPAID',
      customerNo: '001234567890',
    });

    const url = fetchMock.mock.calls[0][0];
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(url).toBe('https://testpostpaid.mobilepulsa.net/api/v1/bill/check');
    expect(body.commands).toBe('pay-pasca');
    expect(body.tr_id).toBe('900001');
    expect(body.sign).toBe(md5(USER + 'secretkey' + '900001'));
    expect(body.ref_id).toBeUndefined();
    expect(body.code).toBeUndefined();
    expect(body.hp).toBeUndefined();
    expect(fetchMock.mock.calls[0][1].signal).toBeDefined();
  });

  it('inquiry PLN memakai code/hp/ref_id dan sign(ref_id), tanpa suffix kategori', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      text: async () => JSON.stringify({ data: { response_code: '00', status: 1, nominal: 100000 } }),
    });
    (global as any).fetch = fetchMock;
    const service = new IakService();

    await service.transactionPascabayar({
      command: 'inq-pasca',
      refId: 'PSC900002',
      sku: 'PLNPOSTPAID',
      customerNo: '001234567890',
      providerType: 'pln',
    });

    const url = fetchMock.mock.calls[0][0];
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(url).toBe('https://testpostpaid.mobilepulsa.net/api/v1/bill/check');
    expect(body.commands).toBe('inq-pasca');
    expect(body.code).toBe('PLNPOSTPAID');
    expect(body.hp).toBe('001234567890');
    expect(body.ref_id).toBe('PSC900002');
    expect(body.sign).toBe(md5(USER + 'secretkey' + 'PSC900002'));
    expect(body.customer_id).toBeUndefined();
    expect(body.product_code).toBeUndefined();
  });

  it('status memakai commands checkstatus, ref_id, dan sign literal cs', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      text: async () => JSON.stringify({ data: { response_code: '00', status: 1 } }),
    });
    (global as any).fetch = fetchMock;
    const service = new IakService();

    await service.transactionPascabayar({
      command: 'status-pasca',
      refId: 'PSC900003',
      trId: '900003',
      sku: 'PLNPOSTPAID',
      customerNo: '001234567890',
    });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.commands).toBe('checkstatus');
    expect(body.ref_id).toBe('PSC900003');
    expect(body.sign).toBe(md5(USER + 'secretkey' + 'cs'));
    expect(body.tr_id).toBeUndefined();
  });

  it('pembayaran tanpa tr_id ditolak tanpa memanggil HTTP', async () => {
    const fetchMock = jest.fn();
    (global as any).fetch = fetchMock;
    const service = new IakService();

    await expect(
      service.transactionPascabayar({ command: 'pay-pasca', refId: 'PSC900004', sku: 'X', customerNo: '1' }),
    ).rejects.toBeDefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('additionalData yang tidak didukung kategori ditolak sebelum request', async () => {
    const fetchMock = jest.fn();
    (global as any).fetch = fetchMock;
    const service = new IakService();

    await expect(
      service.transactionPascabayar({
        command: 'inq-pasca',
        refId: 'PSC900005',
        sku: 'PLNPOSTPAID',
        customerNo: '001234567890',
        providerType: 'pln',
        additionalData: { kode_kabupaten: '3171' },
      }),
    ).rejects.toBeDefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('additionalData tidak dapat menimpa commands/sign/code/hp/ref_id', async () => {
    const fetchMock = jest.fn();
    (global as any).fetch = fetchMock;
    const service = new IakService();

    await expect(
      service.transactionPascabayar({
        command: 'inq-pasca',
        refId: 'PSC900006',
        sku: 'PLNPOSTPAID',
        customerNo: '001234567890',
        providerType: 'pln',
        additionalData: { commands: 'pay-pasca', sign: 'HACK', ref_id: 'HACK', code: 'HACK', hp: 'HACK' },
      }),
    ).rejects.toBeDefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('kategori pascabayar yang belum didukung ditolak sebelum request', async () => {
    const fetchMock = jest.fn();
    (global as any).fetch = fetchMock;
    const service = new IakService();

    await expect(
      service.transactionPascabayar({
        command: 'inq-pasca',
        refId: 'PSC900007',
        sku: 'PBB-SKU',
        customerNo: '123',
        providerType: 'pbb',
      }),
    ).rejects.toBeDefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
