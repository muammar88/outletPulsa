import { LinkquReconciliationService } from './linkqu-reconciliation.service';
import { PrismaService } from '../../prisma.service';

describe('LinkquReconciliationService (ISSUE-008: inquiry, digerakkan konfigurasi)', () => {
  const ENV_KEYS = [
    'LINKQU_INQUIRY_ENABLED',
    'LINKQU_INQUIRY_PATH',
    'LINKQU_INQUIRY_STATUS_FIELD',
    'LINKQU_INQUIRY_DEBOUNCE_MS',
    'LINKQU_INQUIRY_MIN_AGE_MS',
  ] as const;
  const savedEnv: Record<string, string | undefined> = {};

  let prismaMock: any;
  let service: LinkquReconciliationService;
  const originalFetch = global.fetch;

  beforeAll(() => {
    for (const key of ENV_KEYS) savedEnv[key] = process.env[key];
  });

  afterAll(() => {
    for (const key of ENV_KEYS) {
      if (savedEnv[key] === undefined) delete process.env[key];
      else process.env[key] = savedEnv[key];
    }
    global.fetch = originalFetch;
  });

  beforeEach(() => {
    for (const key of ENV_KEYS) delete process.env[key];
    prismaMock = {
      paymentGatewayTransaction: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      paymentGatewayCallbackInbox: {
        create: jest.fn().mockResolvedValue({ id: 1 }),
      },
      pengaturanUmum: {
        findFirst: jest.fn().mockResolvedValue({
          linkqu_client_id: 'client123',
          linkqu_client_secret: 'secret123',
          linkqu_signature_key: 'sigkey',
          linkqu_merchant_code: 'M1',
          linkqu_pin: '1234',
          linkqu_is_sandbox: true,
        }),
      },
    };
    service = new LinkquReconciliationService(prismaMock as unknown as PrismaService);
  });

  function buildTx() {
    return {
      id: 1,
      partner_reff: 'DP-1-INQ',
      amount: 50000,
      status: 'PENDING',
      provider: 'LINKQU',
      metadata: JSON.stringify({ state: 'AWAITING_PROVIDER_CONFIRMATION' }),
    };
  }

  it('default (tanpa env): tidak melakukan inquiry atau menulis event', async () => {
    global.fetch = jest.fn();
    const result = await service.reconcilePending();

    expect(result).toEqual({ attempted: 0, enqueued: 0 });
    expect(global.fetch).not.toHaveBeenCalled();
    expect(prismaMock.paymentGatewayCallbackInbox.create).not.toHaveBeenCalled();
  });

  it('mengaktifkan inquiry dan membuat event INQUIRY saat provider menyatakan SUCCESS', async () => {
    process.env.LINKQU_INQUIRY_ENABLED = 'true';
    process.env.LINKQU_INQUIRY_PATH = '/linkqu-partner/transaction/status';
    prismaMock.paymentGatewayTransaction.findMany.mockResolvedValue([buildTx()]);
    global.fetch = jest.fn().mockResolvedValue({
      text: jest.fn().mockResolvedValue(JSON.stringify({ status: 'SUCCESS', client_id: 'client123' })),
    } as any);

    const result = await service.reconcilePending();

    expect(result).toEqual({ attempted: 1, enqueued: 1 });
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(prismaMock.paymentGatewayCallbackInbox.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          provider: 'LINKQU',
          event_type: 'INQUIRY',
          partner_reff: 'DP-1-INQ',
          status: 'PENDING',
        }),
      }),
    );
    const createdPayload = JSON.parse(
      prismaMock.paymentGatewayCallbackInbox.create.mock.calls[0][0].data.payload,
    );
    expect(createdPayload.status).toBe('SUCCESS');
    expect(createdPayload.response_code).toBe('00');
  });

  it('mematuhi jeda/cache: tidak inquiry ulang bila baru saja diperiksa', async () => {
    process.env.LINKQU_INQUIRY_ENABLED = 'true';
    process.env.LINKQU_INQUIRY_PATH = '/linkqu-partner/transaction/status';
    prismaMock.paymentGatewayTransaction.findMany.mockResolvedValue([
      { ...buildTx(), metadata: JSON.stringify({ last_inquiry_at: new Date().toISOString() }) },
    ]);
    global.fetch = jest.fn();

    const result = await service.reconcilePending();

    expect(result).toEqual({ attempted: 0, enqueued: 0 });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('status inquiry asing tidak membuat event terminal', async () => {
    process.env.LINKQU_INQUIRY_ENABLED = 'true';
    process.env.LINKQU_INQUIRY_PATH = '/linkqu-partner/transaction/status';
    prismaMock.paymentGatewayTransaction.findMany.mockResolvedValue([buildTx()]);
    global.fetch = jest.fn().mockResolvedValue({
      text: jest.fn().mockResolvedValue(JSON.stringify({ status: 'SOMETHING_ELSE' })),
    } as any);

    const result = await service.reconcilePending();

    expect(result).toEqual({ attempted: 1, enqueued: 0 });
    expect(prismaMock.paymentGatewayCallbackInbox.create).not.toHaveBeenCalled();
  });

  it('reconcileOne memakai kredensial server-to-server pada header', async () => {
    process.env.LINKQU_INQUIRY_ENABLED = 'true';
    process.env.LINKQU_INQUIRY_PATH = '/linkqu-partner/transaction/status';
    prismaMock.paymentGatewayTransaction.findUnique.mockResolvedValue(buildTx());
    global.fetch = jest.fn().mockResolvedValue({
      text: jest.fn().mockResolvedValue(JSON.stringify({ status: 'PENDING' })),
    } as any);

    const result = await service.reconcileOne('DP-1-INQ');

    expect(result.attempted).toBe(true);
    const fetchArgs = (global.fetch as jest.Mock).mock.calls[0];
    expect(fetchArgs[1].headers['client-id']).toBe('client123');
    expect(fetchArgs[1].headers['client-secret']).toBe('secret123');
  });
});
