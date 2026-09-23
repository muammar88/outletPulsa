import { Test, TestingModule } from '@nestjs/testing';
import { TransaksiService } from './transaksi.service';
import { PrismaService } from '../../prisma.service';
import { IakService } from '../../providers/iak.service';
import { DigiflazzService } from '../../providers/digiflazz.service';
import { TripayService } from '../../providers/tripay.service';
import { PengumumanService } from '../../pengumuman/pengumuman.service';
import { TransaksiFinalizerService } from './transaksi-finalizer.service';

describe('ISSUE-002: Transaksi Submit & Idempotensi', () => {
  let service: TransaksiService;
  let mockPrisma: any;
  let mockIak: any;
  let mockDigi: any;
  let mockTripay: any;
  let mockPengumuman: any;
  let mockFinalizer: any;

  beforeEach(async () => {
    mockIak = {
      topUp: jest.fn(),
      checkStatus: jest.fn(),
    };
    mockDigi = {
      topUp: jest.fn(),
      checkStatus: jest.fn(),
    };
    mockTripay = {
      topUp: jest.fn(),
      checkStatus: jest.fn(),
    };
    mockPengumuman = {
      sendTransactionStatus: jest.fn().mockResolvedValue(true),
    };
    mockFinalizer = {
      finalizeTransaction: jest.fn().mockResolvedValue({ status: 'sukses', transaction: {} }),
    };

    mockPrisma = {
      produk: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      member: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      iakPrabayarProduk: {
        findFirst: jest.fn(),
      },
      digiflazzProduct: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      tripayPrabayarProduk: {
        findFirst: jest.fn(),
      },
      transaction: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      digiflazzTransaction: {
        create: jest.fn(),
      },
      riwayatTransaksi: {
        create: jest.fn().mockResolvedValue({ id: 101 }),
      },
      $transaction: jest.fn().mockImplementation(async (callback) => {
        return await callback(mockPrisma);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransaksiService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: IakService, useValue: mockIak },
        { provide: DigiflazzService, useValue: mockDigi },
        { provide: TripayService, useValue: mockTripay },
        { provide: PengumumanService, useValue: mockPengumuman },
        { provide: TransaksiFinalizerService, useValue: mockFinalizer },
      ],
    }).compile();

    service = module.get<TransaksiService>(TransaksiService);
  });

  it('1. Replay key sama dengan payload sama: mengembalikan transaksi lama tanpa debit baru', async () => {
    const existingKode = 'TRX99998888';
    mockPrisma.transaction.findFirst.mockResolvedValue({
      id: 50,
      kode: existingKode,
      nomorTujuan: '08123456789',
      status: 'proses',
      produk: { kode: 'TLKM5' },
      ket: '[SNAPSHOT:{"idemp":"IDEMP-001","sku":"htelkomsel5000"}]',
    });

    const res = await service.createTransaksiPrabayar(1, {
      kode_produk: 'TLKM5',
      nomor_tujuan: '08123456789',
      idempotency_key: 'IDEMP-001',
    });

    expect(res.error).toBe(false);
    expect(res.kodeTransaksi).toBe(existingKode);
    // Tidak potong saldo dan tidak panggil provider
    expect(mockPrisma.member.update).not.toHaveBeenCalled();
    expect(mockIak.topUp).not.toHaveBeenCalled();
  });

  it('2. Key sama tapi nomor tujuan berbeda: ditolak tanpa efek tambahan', async () => {
    mockPrisma.transaction.findFirst.mockResolvedValue({
      id: 50,
      kode: 'TRX99998888',
      nomorTujuan: '08123456789',
      status: 'proses',
      produk: { kode: 'TLKM5' },
      ket: '[SNAPSHOT:{"idemp":"IDEMP-001","sku":"htelkomsel5000"}]',
    });

    const res = await service.createTransaksiPrabayar(1, {
      kode_produk: 'TLKM5',
      nomor_tujuan: '08999999999', // nomor tujuan berbeda!
      idempotency_key: 'IDEMP-001',
    });

    expect(res.error).toBe(true);
    expect(res.error_msg).toContain('Idempotency key sudah digunakan');
    expect(mockPrisma.member.update).not.toHaveBeenCalled();
    expect(mockIak.topUp).not.toHaveBeenCalled();
  });

  it('3. Provider sukses langsung: memanggil finalizer sukses seketika', async () => {
    mockPrisma.produk.findFirst.mockResolvedValue({
      id: 1,
      kode: 'TLKM5',
      purchase_price: 5000,
      markup: 1000,
      serverId: 1,
      server: { kode: 'IAK' },
    });
    mockPrisma.iakPrabayarProduk.findFirst.mockResolvedValue({ kode: 'htelkomsel5000' });
    mockPrisma.member.findUnique.mockResolvedValue({ id: 1, saldo: 50000 });
    mockPrisma.member.update.mockResolvedValue({ id: 1, saldo: 44000 });
    mockPrisma.transaction.create.mockResolvedValue({ id: 77, kode: 'TRX-NEW-1' });

    mockIak.topUp.mockResolvedValue({
      trx_id: 12345,
      status_success: true,
      sn: 'SN123456789',
      price: 5100,
      raw_response: { data: { status: 1 } },
    });

    const res = await service.createTransaksiPrabayar(1, {
      kode_produk: 'TLKM5',
      nomor_tujuan: '08123456789',
    });

    expect(res.error).toBe(false);
    expect(mockFinalizer.finalizeTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        transactionId: 77,
        targetStatus: 'sukses',
        sn: 'SN123456789',
        source: 'PROVIDER_DIRECT_SUCCESS',
      }),
    );
  });

  it('4. Provider gagal final: memanggil finalizer gagal dan refund', async () => {
    mockPrisma.produk.findFirst.mockResolvedValue({
      id: 1,
      kode: 'TLKM5',
      purchase_price: 5000,
      markup: 1000,
      serverId: 1,
      server: { kode: 'IAK' },
    });
    mockPrisma.iakPrabayarProduk.findFirst.mockResolvedValue({ kode: 'htelkomsel5000' });
    mockPrisma.member.findUnique.mockResolvedValue({ id: 1, saldo: 50000 });
    mockPrisma.member.update.mockResolvedValue({ id: 1, saldo: 44000 });
    mockPrisma.transaction.create.mockResolvedValue({ id: 78, kode: 'TRX-NEW-2' });

    mockIak.topUp.mockResolvedValue({
      trx_id: 12346,
      status_success: false,
      raw_response: { data: { status: 2, message: 'Nomor tidak aktif' } },
    });

    const res = await service.createTransaksiPrabayar(1, {
      kode_produk: 'TLKM5',
      nomor_tujuan: '08123456789',
    });

    expect(res.error).toBe(false);
    expect(mockFinalizer.finalizeTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        transactionId: 78,
        targetStatus: 'gagal',
        source: 'PROVIDER_DIRECT_FAILED',
      }),
    );
  });

  it('5. Provider timeout/pending: tetap proses, tidak refund otomatis', async () => {
    mockPrisma.produk.findFirst.mockResolvedValue({
      id: 1,
      kode: 'TLKM5',
      purchase_price: 5000,
      markup: 1000,
      serverId: 1,
      server: { kode: 'IAK' },
    });
    mockPrisma.iakPrabayarProduk.findFirst.mockResolvedValue({ kode: 'htelkomsel5000' });
    mockPrisma.member.findUnique.mockResolvedValue({ id: 1, saldo: 50000 });
    mockPrisma.member.update.mockResolvedValue({ id: 1, saldo: 44000 });
    mockPrisma.transaction.create.mockResolvedValue({ id: 79, kode: 'TRX-NEW-3' });

    // Mock timeout or network rejection
    mockIak.topUp.mockRejectedValue(new Error('Network timeout'));

    const res = await service.createTransaksiPrabayar(1, {
      kode_produk: 'TLKM5',
      nomor_tujuan: '08123456789',
    });

    expect(res.error).toBe(false);
    // Finalizer TIDAK boleh dipanggil saat timeout
    expect(mockFinalizer.finalizeTransaction).not.toHaveBeenCalled();
  });

  it('6. Provider trx_id non-numeric / string aman: tidak crash dan tidak menjadi NaN', async () => {
    mockPrisma.produk.findFirst.mockResolvedValue({
      id: 1,
      kode: 'TLKM5',
      purchase_price: 5000,
      markup: 1000,
      serverId: 1,
      server: { kode: 'IAK' },
    });
    mockPrisma.iakPrabayarProduk.findFirst.mockResolvedValue({ kode: 'htelkomsel5000' });
    mockPrisma.member.findUnique.mockResolvedValue({ id: 1, saldo: 50000 });
    mockPrisma.member.update.mockResolvedValue({ id: 1, saldo: 44000 });
    mockPrisma.transaction.create.mockResolvedValue({ id: 80, kode: 'TRX-NEW-4' });

    mockIak.topUp.mockResolvedValue({
      trx_id: 'TRX-UUID-LONG-9999999999999999',
      status_success: false,
      raw_response: { data: { status: 0 } }, // pending
    });

    const res = await service.createTransaksiPrabayar(1, {
      kode_produk: 'TLKM5',
      nomor_tujuan: '08123456789',
    });

    expect(res.error).toBe(false);
    expect(mockPrisma.transaction.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 80 },
        data: expect.objectContaining({
          trx_id: null, // safeTrxId is null because it's not a safe integer
          serial_number: 'TRX-UUID-LONG-9999999999999999',
        }),
      }),
    );
  });

  it('7. Saldo tidak mencukupi: ditolak sebelum potong saldo', async () => {
    mockPrisma.produk.findFirst.mockResolvedValue({
      id: 1,
      kode: 'TLKM5',
      purchase_price: 5000,
      markup: 1000,
      serverId: 1,
      server: { kode: 'IAK' },
    });
    mockPrisma.iakPrabayarProduk.findFirst.mockResolvedValue({ kode: 'htelkomsel5000' });
    mockPrisma.member.findUnique.mockResolvedValue({ id: 1, saldo: 2000 }); // hanya 2000, butuh 6000

    const res = await service.createTransaksiPrabayar(1, {
      kode_produk: 'TLKM5',
      nomor_tujuan: '08123456789',
    });

    expect(res.error).toBe(true);
    expect(res.error_msg).toContain('Saldo member tidak mencukupi');
    expect(mockPrisma.member.update).not.toHaveBeenCalled();
    expect(mockIak.topUp).not.toHaveBeenCalled();
  });
});
