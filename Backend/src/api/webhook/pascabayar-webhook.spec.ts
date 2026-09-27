import { HttpException } from '@nestjs/common';
import * as crypto from 'crypto';
import { WebhookService } from './webhook.service';

function buildService() {
  const prisma: any = {
    transaction: { findFirst: jest.fn().mockResolvedValue(null) },
    transactionPascabayar: { findFirst: jest.fn() },
    webhookLog: { create: jest.fn().mockResolvedValue({}) },
  };
  const pengumuman = { sendTransactionStatus: jest.fn() };
  const socket = { emitTransactionUpdated: jest.fn() };
  const finalizer = { finalizeSuccess: jest.fn(), finalizeFailure: jest.fn() };
  const service = new WebhookService(
    prisma,
    pengumuman as any,
    socket as any,
    {} as any,
    {} as any,
    {} as any,
    {} as any,
    finalizer as any,
  );
  return { service, prisma, finalizer };
}

function sign(secret: string, rawBody: string): string {
  return 'sha1=' + crypto.createHmac('sha1', secret).update(rawBody).digest('hex');
}

describe('WebhookService pascabayar Digiflazz', () => {
  const savedSecret = process.env.DIGIFLAZZ_WEBHOOK_SECRET;
  afterEach(() => {
    if (savedSecret === undefined) delete process.env.DIGIFLAZZ_WEBHOOK_SECRET;
    else process.env.DIGIFLAZZ_WEBHOOK_SECRET = savedSecret;
    jest.clearAllMocks();
  });

  it('menolak callback bila secret belum dikonfigurasi (fail-closed)', async () => {
    delete process.env.DIGIFLAZZ_WEBHOOK_SECRET;
    const { service, finalizer } = buildService();
    await expect(
      service.handleDigiflazzCallback('sha1=apa-saja', '{}', { data: { ref_id: 'R1' } } as any, '127.0.0.1'),
    ).rejects.toBeInstanceOf(HttpException);
    expect(finalizer.finalizeSuccess).not.toHaveBeenCalled();
  });

  it('menolak signature yang salah tanpa mengubah transaksi', async () => {
    process.env.DIGIFLAZZ_WEBHOOK_SECRET = 'rahasia';
    const { service, prisma, finalizer } = buildService();
    await expect(
      service.handleDigiflazzCallback('sha1=salah', '{data:{ref_id:R1}}', { data: { ref_id: 'R1' } } as any, 'ip'),
    ).rejects.toBeInstanceOf(HttpException);
    expect(prisma.transactionPascabayar.findFirst).not.toHaveBeenCalled();
    expect(finalizer.finalizeSuccess).not.toHaveBeenCalled();
  });

  it('menolak bila SKU/pelanggan tidak cocok dengan snapshot', async () => {
    process.env.DIGIFLAZZ_WEBHOOK_SECRET = 'rahasia';
    const rawBody = JSON.stringify({ data: { ref_id: 'R1', buyer_sku_code: 'SKU-BEDA', customer_no: '999', rc: '00' } });
    const { service, prisma, finalizer } = buildService();
    prisma.transactionPascabayar.findFirst.mockResolvedValue({
      id: 1,
      status: 'proses',
      provider: 'DIGIFLAZZ',
      providerSku: 'SKU-ASLI',
      nomorTujuan: '123',
    });

    await expect(
      service.handleDigiflazzCallback(sign('rahasia', rawBody), rawBody, JSON.parse(rawBody), 'ip'),
    ).rejects.toBeInstanceOf(HttpException);
    expect(finalizer.finalizeSuccess).not.toHaveBeenCalled();
  });

  it('meneruskan callback valid yang cocok ke finalizer', async () => {
    process.env.DIGIFLAZZ_WEBHOOK_SECRET = 'rahasia';
    const rawBody = JSON.stringify({ data: { ref_id: 'R1', buyer_sku_code: 'SKU-ASLI', customer_no: '123', rc: '00', sn: 'SN1' } });
    const { service, prisma, finalizer } = buildService();
    prisma.transactionPascabayar.findFirst.mockResolvedValue({
      id: 1,
      status: 'proses',
      provider: 'DIGIFLAZZ',
      providerSku: 'SKU-ASLI',
      nomorTujuan: '123',
    });

    const res = await service.handleDigiflazzCallback(sign('rahasia', rawBody), rawBody, JSON.parse(rawBody), 'ip');
    expect(res.error).toBe(false);
    expect(finalizer.finalizeSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ transactionId: 1, sn: 'SN1', actualBillAmount: null }),
    );
  });
});

