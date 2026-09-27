import { Test, TestingModule } from '@nestjs/testing';
import { WebhookModule } from './webhook.module';
import {
  LinkquCallbackProcessorService,
  LINKQU_SETTLEMENT_ADAPTER,
} from './linkqu-callback-processor.service';
import { LinkquSettlementAdapter } from './linkqu-settlement.adapter';
import { TestLinkquSettlementAdapter } from './test-only/test-linkqu-settlement.adapter';
import { PrismaService } from '../../prisma.service';
import { SocketService } from '../../socket/socket.service';
import { PengumumanService } from '../../pengumuman/pengumuman.service';

/**
 * F5: membuktikan jalur PRODUKSI memakai adapter settlement nyata, bukan adapter test-only.
 * Tes ini tidak menyentuh provider eksternal; semua I/O database dimock.
 */
describe('Wiring settlement LinkQu produksi (F5)', () => {
  const PARTNER_REFF = 'DP-PROD-WIRING-001';

  const originalAuthorized = process.env.LINKQU_CALLBACK_SETTLEMENT_AUTHORIZED;

  beforeEach(() => {
    // Tes kredit produksi secara eksplisit mengaktifkan otorisasi (mensimulasikan kontrak sudah diverifikasi).
    process.env.LINKQU_CALLBACK_SETTLEMENT_AUTHORIZED = 'true';
  });

  afterAll(() => {
    if (originalAuthorized === undefined) {
      delete process.env.LINKQU_CALLBACK_SETTLEMENT_AUTHORIZED;
    } else {
      process.env.LINKQU_CALLBACK_SETTLEMENT_AUTHORIZED = originalAuthorized;
    }
  });

  it('default: kredit DITAHAN dan tidak ada mutasi saldo sebelum otorisasi', async () => {
    delete process.env.LINKQU_CALLBACK_SETTLEMENT_AUTHORIZED;
    const prismaMock = buildPrismaMock();
    const adapter = new LinkquSettlementAdapter(
      prismaMock as unknown as PrismaService,
      { emitTransactionUpdated: jest.fn() } as unknown as SocketService,
      { sendTransactionStatus: jest.fn() } as unknown as PengumumanService,
    );

    const result = await adapter.executeSettlement(
      buildItem(),
      buildTx(),
      true,
      PARTNER_REFF,
      'worker-prod-1',
      'SUCCESS',
    );

    expect(result.status).toBe('FAILED');
    expect(result.message).toBe('Held for contract verification');
    expect(prismaMock.member.update).not.toHaveBeenCalled();
    expect(prismaMock.riwayatSaldo.create).not.toHaveBeenCalled();
    expect(prismaMock.paymentGatewayTransaction.updateMany).not.toHaveBeenCalled();
    expect(prismaMock.paymentGatewayCallbackInbox.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'PROCESSING', locked_by: 'worker-prod-1' }),
      }),
    );
  });

  function buildPrismaMock() {
    const prismaMock: any = {
      paymentGatewayCallbackInbox: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      paymentGatewayTransaction: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        update: jest.fn().mockResolvedValue({}),
        findUnique: jest.fn(),
      },
      requestDeposit: {
        update: jest.fn().mockResolvedValue({}),
      },
      member: {
        update: jest.fn().mockResolvedValue({ id: 1, saldo: 150000 }),
      },
      riwayatSaldo: {
        create: jest.fn().mockResolvedValue({ id: 99 }),
      },
      activityLog: {
        create: jest.fn().mockResolvedValue({ id: 1 }),
      },
      $transaction: jest.fn(async (cb: any) => cb(prismaMock)),
    };
    return prismaMock;
  }

  function buildTx() {
    return {
      id: 100,
      uuid: 'uuid-100',
      partner_reff: PARTNER_REFF,
      amount: 50000,
      payment_method: 'VA',
      provider: 'LINKQU',
      reference_type: 'DEPOSIT',
      requestDeposit: {
        id: 200,
        kode: 'DEP-200',
        status: 'proses',
        nominal: 50000,
        riwayatTransaksiId: 300,
        riwayatTransaksi: { member: { id: 1, saldo: 100000 } },
      },
    };
  }

  function buildItem() {
    return {
      id: 1,
      locked_by: 'worker-prod-1',
      locked_until: new Date(Date.now() + 30000),
      retry_count: 0,
      max_retries: 5,
      payload: JSON.stringify({ partner_reff: PARTNER_REFF, amount: 50000, status: 'SUCCESS' }),
    };
  }

  it('WebhookModule mendaftarkan LINKQU_SETTLEMENT_ADAPTER dengan adapter produksi (bukan test-only)', () => {
    const providers = Reflect.getMetadata('providers', WebhookModule) || [];
    const adapterProvider = providers.find(
      (p: any) => p && p.provide === LINKQU_SETTLEMENT_ADAPTER,
    );

    expect(adapterProvider).toBeDefined();
    expect(adapterProvider.useClass).toBe(LinkquSettlementAdapter);
    expect(adapterProvider.useClass).not.toBe(TestLinkquSettlementAdapter);
  });

  it('adapter produksi mengkredit saldo tepat sekali dengan settlement_ref deterministik', async () => {
    const prismaMock = buildPrismaMock();
    const socketMock: any = { emitTransactionUpdated: jest.fn() };
    const pengumumanMock: any = { sendTransactionStatus: jest.fn().mockResolvedValue(true) };

    const adapter = new LinkquSettlementAdapter(
      prismaMock as unknown as PrismaService,
      socketMock as unknown as SocketService,
      pengumumanMock as unknown as PengumumanService,
    );

    const result = await adapter.executeSettlement(
      buildItem(),
      buildTx(),
      true,
      PARTNER_REFF,
      'worker-prod-1',
      'SUCCESS',
    );

    expect(result.status).toBe('PROCESSED');
    expect(prismaMock.paymentGatewayTransaction.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 100, status: 'PENDING' },
        data: expect.objectContaining({
          status: 'SUCCESS',
          settlement_ref: `SETTLE-LINKQU-${PARTNER_REFF}`,
        }),
      }),
    );
    expect(prismaMock.member.update).toHaveBeenCalledTimes(1);
    expect(prismaMock.riwayatSaldo.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.riwayatSaldo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          settlement_ref: `SETTLE-LINKQU-${PARTNER_REFF}`,
          nominal: 50000,
          saldo_sebelumnya: 100000,
          saldo_setelahnya: 150000,
        }),
      }),
    );
  });

  it('adapter produksi tidak mengkredit ulang jika transaksi sudah SUCCESS', async () => {
    const prismaMock = buildPrismaMock();
    prismaMock.paymentGatewayTransaction.updateMany.mockResolvedValue({ count: 0 });
    prismaMock.paymentGatewayTransaction.findUnique.mockResolvedValue({ id: 100, status: 'SUCCESS' });

    const adapter = new LinkquSettlementAdapter(
      prismaMock as unknown as PrismaService,
      { emitTransactionUpdated: jest.fn() } as unknown as SocketService,
      { sendTransactionStatus: jest.fn() } as unknown as PengumumanService,
    );

    const result = await adapter.executeSettlement(
      buildItem(),
      buildTx(),
      true,
      PARTNER_REFF,
      'worker-prod-1',
      'SUCCESS',
    );

    expect(result.status).toBe('PROCESSED');
    expect(prismaMock.member.update).not.toHaveBeenCalled();
    expect(prismaMock.riwayatSaldo.create).not.toHaveBeenCalled();
  });

  it('adapter produksi menandai CONFLICT untuk SUCCESS terlambat setelah FAILED tanpa kredit', async () => {
    const prismaMock = buildPrismaMock();
    prismaMock.paymentGatewayTransaction.updateMany.mockResolvedValue({ count: 0 });
    prismaMock.paymentGatewayTransaction.findUnique.mockResolvedValue({ id: 100, status: 'FAILED' });

    const adapter = new LinkquSettlementAdapter(
      prismaMock as unknown as PrismaService,
      { emitTransactionUpdated: jest.fn() } as unknown as SocketService,
      { sendTransactionStatus: jest.fn() } as unknown as PengumumanService,
    );

    const result = await adapter.executeSettlement(
      buildItem(),
      buildTx(),
      true,
      PARTNER_REFF,
      'worker-prod-1',
      'SUCCESS',
    );

    expect(result.status).toBe('CONFLICT');
    expect(prismaMock.member.update).not.toHaveBeenCalled();
    expect(prismaMock.activityLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: 'LATE_SUCCESS_SETTLEMENT_CONFLICT' }),
      }),
    );
  });

  it('catch memakai fencing lease: tidak menimpa inbox bila lease bukan milik worker ini', async () => {
    const prismaMock = buildPrismaMock();
    prismaMock.requestDeposit.update.mockRejectedValue(new Error('DB_FAIL'));
    prismaMock.paymentGatewayCallbackInbox.updateMany.mockResolvedValue({ count: 0 });

    const adapter = new LinkquSettlementAdapter(
      prismaMock as unknown as PrismaService,
      { emitTransactionUpdated: jest.fn() } as unknown as SocketService,
      { sendTransactionStatus: jest.fn() } as unknown as PengumumanService,
    );

    const result = await adapter.executeSettlement(
      buildItem(),
      buildTx(),
      true,
      PARTNER_REFF,
      'worker-prod-1',
      'SUCCESS',
    );

    expect(result.status).toBe('FAILED');
    expect(prismaMock.paymentGatewayCallbackInbox.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: 1,
          status: 'PROCESSING',
          locked_by: 'worker-prod-1',
        }),
      }),
    );
  });
});
