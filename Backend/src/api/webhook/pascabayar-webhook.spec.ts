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
      trId: 'R1',
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
      trId: 'R1',
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

  it('tidak memfinalisasi callback dengan rc sukses tetapi status gagal', async () => {
    process.env.DIGIFLAZZ_WEBHOOK_SECRET = 'rahasia';
    const payload = {
      data: {
        ref_id: 'R-CONFLICT',
        buyer_sku_code: 'SKU-ASLI',
        customer_no: '00123',
        rc: '00',
        status: 'Gagal',
        sn: '',
      },
    };
    const rawBody = JSON.stringify(payload);
    const { service, prisma, finalizer } = buildService();
    prisma.transactionPascabayar.findFirst.mockResolvedValue({
      id: 2,
      trId: 'R-CONFLICT',
      status: 'proses',
      provider: 'DIGIFLAZZ',
      providerSku: 'SKU-ASLI',
      nomorTujuan: '00123',
    });

    const result = await service.handleDigiflazzCallback(
      sign('rahasia', rawBody),
      rawBody,
      payload as any,
      'ip',
    );

    expect(result.error).toBe(false);
    expect(finalizer.finalizeSuccess).not.toHaveBeenCalled();
    expect(finalizer.finalizeFailure).not.toHaveBeenCalled();
  });

  it('menolak callback pascabayar bila SKU atau nomor pelanggan tidak tersedia', async () => {
    process.env.DIGIFLAZZ_WEBHOOK_SECRET = 'rahasia';
    const payload = { data: { ref_id: 'R-MISSING', rc: '00', status: 'Sukses', sn: 'SN1' } };
    const rawBody = JSON.stringify(payload);
    const { service, prisma, finalizer } = buildService();
    prisma.transactionPascabayar.findFirst.mockResolvedValue({
      id: 3,
      trId: 'R-MISSING',
      status: 'proses',
      provider: 'DIGIFLAZZ',
      providerSku: 'SKU-ASLI',
      nomorTujuan: '00123',
    });

    await expect(
      service.handleDigiflazzCallback(sign('rahasia', rawBody), rawBody, payload as any, 'ip'),
    ).rejects.toBeInstanceOf(HttpException);
    expect(finalizer.finalizeSuccess).not.toHaveBeenCalled();
    expect(finalizer.finalizeFailure).not.toHaveBeenCalled();
  });

  it('memakai rincian desc.detail sebagai tagihan, bukan price', async () => {
    process.env.DIGIFLAZZ_WEBHOOK_SECRET = 'rahasia';
    const payload = {
      data: {
        ref_id: 'R1', buyer_sku_code: 'SKU-ASLI', customer_no: '123', rc: '00', sn: 'SN1',
        price: 10000, admin: 2500,
        desc: { detail: [{ nilai_tagihan: '8000', denda: '500' }] },
      },
    };
    const rawBody = JSON.stringify(payload);
    const { service, prisma, finalizer } = buildService();
    prisma.transactionPascabayar.findFirst.mockResolvedValue({
      id: 1, trId: 'R1', status: 'proses', provider: 'DIGIFLAZZ', providerSku: 'SKU-ASLI', nomorTujuan: '123',
      inquiryPayload: { providerAdminFee: 2000 },
    });

    await service.handleDigiflazzCallback(sign('rahasia', rawBody), rawBody, payload as any, 'ip');
    expect(finalizer.finalizeSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ transactionId: 1, sn: 'SN1', actualBillAmount: 8500, actualProviderAdminFee: 2500 }),
    );
  });

  it('fallback selling_price - admin bila rincian tidak ada, dan tidak memakai price', async () => {
    process.env.DIGIFLAZZ_WEBHOOK_SECRET = 'rahasia';
    const payload = {
      data: { ref_id: 'R1', buyer_sku_code: 'SKU-ASLI', customer_no: '123', rc: '00', sn: 'SN1', price: 10000, admin: 2500, selling_price: 11000 },
    };
    const rawBody = JSON.stringify(payload);
    const { service, prisma, finalizer } = buildService();
    prisma.transactionPascabayar.findFirst.mockResolvedValue({
      id: 1, trId: 'R1', status: 'proses', provider: 'DIGIFLAZZ', providerSku: 'SKU-ASLI', nomorTujuan: '123', inquiryPayload: {},
    });

    await service.handleDigiflazzCallback(sign('rahasia', rawBody), rawBody, payload as any, 'ip');
    expect(finalizer.finalizeSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ actualBillAmount: 8500, actualProviderAdminFee: 2500 }),
    );
  });
});
