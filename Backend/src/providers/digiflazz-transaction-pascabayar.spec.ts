import { DigiflazzService } from './digiflazz.service';

describe('DigiflazzService.transactionPascabayar', () => {
  const originalFetch = (global as any).fetch;
  afterEach(() => {
    (global as any).fetch = originalFetch;
  });

  it('additionalData tidak dapat menimpa commands/ref_id/sign', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      text: async () => JSON.stringify({ data: { rc: '00' } }),
    });
    (global as any).fetch = fetchMock;

    const service = new DigiflazzService();
    await service.transactionPascabayar({
      command: 'inq-pasca',
      refId: 'R1',
      sku: 'SKU',
      customerNo: '123',
      additionalData: { commands: 'pay-pasca', ref_id: 'HACK', sign: 'HACK' },
    });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.commands).toBe('inq-pasca');
    expect(body.ref_id).toBe('R1');
    expect(body.sign).not.toBe('HACK');
    expect(body.buyer_sku_code).toBe('SKU');
  });

  it('respons non-JSON ditolak sebagai error', async () => {
    const fetchMock = jest.fn().mockResolvedValue({ text: async () => '<html>gateway error</html>' });
    (global as any).fetch = fetchMock;
    const service = new DigiflazzService();
    await expect(
      service.transactionPascabayar({ command: 'status-pasca', refId: 'R2', sku: 'SKU', customerNo: '1' }),
    ).rejects.toBeDefined();
  });
});

