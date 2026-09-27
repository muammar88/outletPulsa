import { Test, TestingModule } from '@nestjs/testing';
import { DepositService } from './deposit.service';
import { PrismaService } from '../../prisma.service';
import { PengumumanService } from '../../pengumuman/pengumuman.service';

describe('ISSUE-004: LinkQu Deposit Creation & Validation', () => {
  let service: DepositService;
  let mockPrisma: any;
  let mockPengumuman: any;

  beforeEach(async () => {
    mockPengumuman = {
      sendTransactionStatus: jest.fn().mockResolvedValue(true),
    };

    mockPrisma = {
      pengaturanUmum: {
        findFirst: jest.fn(),
      },
      member: {
        findUnique: jest.fn(),
      },
      bankLinkqu: {
        findFirst: jest.fn(),
      },
      emoneyLinkqu: {
        findFirst: jest.fn(),
      },
      requestDeposit: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      paymentGatewayTransaction: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
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
        DepositService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: PengumumanService, useValue: mockPengumuman },
      ],
    }).compile();

    service = module.get<DepositService>(DepositService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('1. Menolak nominal invalid (-10000, 0, 1.5, abc, < 10000) tanpa panggil provider', async () => {
    const invalidNominals = ['-10000', '0', '1.5', 'abc', '5000', '15000000'];

    for (const nom of invalidNominals) {
      const res = await service.processLinkquDeposit(1, {
        nominal: nom,
        payment_method: 'VA',
        bank_code: '002',
      });

      expect(res.error).toBe(true);
      expect(mockPrisma.paymentGatewayTransaction.create).not.toHaveBeenCalled();
    }
  });

  it('2. Menolak jika gateway LinkQu atau metode pembayaran dinonaktifkan', async () => {
    // Gateway tidak aktif
    mockPrisma.pengaturanUmum.findFirst.mockResolvedValue({
      linkqu_is_active: false,
    });

    const res = await service.processLinkquDeposit(1, {
      nominal: '50000',
      payment_method: 'VA',
      bank_code: '002',
    });

    expect(res.error).toBe(true);
    expect(res.error_msg).toContain('tidak aktif');
    expect(mockPrisma.paymentGatewayTransaction.create).not.toHaveBeenCalled();

    // VA dimatikan
    mockPrisma.pengaturanUmum.findFirst.mockResolvedValue({
      linkqu_is_active: true,
      linkqu_payment_va: false,
    });

    const resVA = await service.processLinkquDeposit(1, {
      nominal: '50000',
      payment_method: 'VA',
      bank_code: '002',
    });

    expect(resVA.error).toBe(true);
    expect(resVA.error_msg).toContain('Virtual Account sedang dinonaktifkan');
  });

  it('3. Menolak jika bank atau e-wallet yang dipilih tidak aktif di database', async () => {
    mockPrisma.pengaturanUmum.findFirst.mockResolvedValue({
      linkqu_is_active: true,
      linkqu_payment_va: true,
    });
    mockPrisma.bankLinkqu.findFirst.mockResolvedValue(null); // Bank tidak ditemukan/nonaktif

    const res = await service.processLinkquDeposit(1, {
      nominal: '50000',
      payment_method: 'VA',
      bank_code: '999', // bank palsu
    });

    expect(res.error).toBe(true);
    expect(res.error_msg).toContain('tidak aktif atau tidak ditemukan');
  });

  it('4. Idempotency: retry dengan key sama mengembalikan data lama tanpa request baru', async () => {
    mockPrisma.pengaturanUmum.findFirst.mockResolvedValue({
      linkqu_is_active: true,
      linkqu_payment_va: true,
      linkqu_client_id: 'test-client',
      linkqu_client_secret: 'test-secret',
      linkqu_signature_key: 'test-sig',
      linkqu_merchant_code: 'TEST',
      linkqu_pin: '1234',
    });
    mockPrisma.bankLinkqu.findFirst.mockResolvedValue({ id: 1, kode: '002', status: true });
    mockPrisma.member.findUnique.mockResolvedValue({
      id: 1,
      fullname: 'Budi Test',
      whatsappnumber: '081234567899',
    });

    // Simulasi transaksi lama sudah ada di DB
    mockPrisma.paymentGatewayTransaction.findUnique.mockResolvedValue({
      uuid: 'tx-uuid-1234',
      partner_reff: 'DP-1-IDEMP-001',
      payment_method: 'VA',
      bank_code: '002',
      bank_name: 'BRI',
      virtual_account: '88880001234',
      amount: 50000,
      fee_admin: 1500,
      total_amount: 51500,
      status: 'PENDING',
      metadata: JSON.stringify({}),
    });

    const res = await service.processLinkquDeposit(1, {
      nominal: '50000',
      payment_method: 'VA',
      bank_code: '002',
      idempotency_key: 'IDEMP-001',
    });

    expect(res.error).toBe(false);
    expect(res.data.transaction_id).toBe('tx-uuid-1234');
    expect(res.data.virtual_account).toBe('88880001234');
    // Tidak membuat transaksi DB baru
    expect(mockPrisma.paymentGatewayTransaction.create).not.toHaveBeenCalled();
  });

  it('5. Pre-commit di DB sebelum panggil provider, normalisasi fee string & number', async () => {
    mockPrisma.pengaturanUmum.findFirst.mockResolvedValue({
      linkqu_is_active: true,
      linkqu_payment_va: true,
      linkqu_client_id: 'client123',
      linkqu_client_secret: 'secret123',
      linkqu_signature_key: 'sig123',
      linkqu_merchant_code: 'TEST',
      linkqu_pin: '1234',
    });
    mockPrisma.bankLinkqu.findFirst.mockResolvedValue({ id: 1, kode: '002', status: true });
    mockPrisma.member.findUnique.mockResolvedValue({
      id: 1,
      fullname: 'Budi Test',
      whatsappnumber: '081234567899',
    });

    mockPrisma.paymentGatewayTransaction.findUnique.mockResolvedValue(null);
    mockPrisma.requestDeposit.create.mockResolvedValue({ id: 501, kode: 'DEP123' });
    mockPrisma.paymentGatewayTransaction.create.mockResolvedValue({
      id: 201,
      uuid: 'new-uuid-99',
      status: 'PENDING',
    });

    mockPrisma.paymentGatewayTransaction.update.mockResolvedValue({
      id: 201,
      uuid: 'new-uuid-99',
      payment_method: 'VA',
      bank_code: '002',
      bank_name: 'BRI',
      virtual_account: '99990001234',
      amount: 50000,
      fee_admin: 2000,
      total_amount: 52000,
      status: 'PENDING',
      partner_reff: 'DP-1-12345',
    });

    // Mock fetch LinkQu API
    global.fetch = jest.fn().mockResolvedValue({
      text: jest.fn().mockResolvedValue(
        JSON.stringify({
          response_code: '00',
          status: 'SUCCESS',
          virtual_account: '99990001234',
          feeadmin: '2000', // String fee dinormalisasi ke number
          bank_name: 'BRI',
        }),
      ),
    } as any);

    const res = await service.processLinkquDeposit(1, {
      nominal: 50000,
      payment_method: 'VA',
      bank_code: '002',
    });

    expect(res.error).toBe(false);
    expect(res.data.virtual_account).toBe('99990001234');
    expect(res.data.fee_admin).toBe(2000);
    expect(res.data.total_amount).toBe(52000);

    // Memastikan record dibuat di DB SEBELUM provider selesai (tercatat via create)
    expect(mockPrisma.paymentGatewayTransaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'PENDING',
          amount: 50000,
        }),
      }),
    );
  });

  it('6. getPaymentGatewayDetail dapat mengambil detail transaksi pembayaran', async () => {
    mockPrisma.paymentGatewayTransaction.findFirst.mockResolvedValue({
      id: 201,
      uuid: 'uuid-abc-123',
      partner_reff: 'DP-1-998877',
      payment_method: 'QRIS',
      amount: 75000,
      fee_admin: 750,
      total_amount: 75750,
      status: 'PENDING',
      metadata: JSON.stringify({
        qris_text: '00020101021226...',
        imageqris: 'https://linkqu.id/qr/123.png',
      }),
    });

    const res = await service.getPaymentGatewayDetail(1, 'uuid-abc-123');
    expect(res.error).toBe(false);
    expect(res.data.transaction_id).toBe('uuid-abc-123');
    expect(res.data.qris_text).toBe('00020101021226...');
    expect(res.data.imageqris).toBe('https://linkqu.id/qr/123.png');
  });

  it('7. Menolak idempotency key sama dengan nominal berbeda (konflik, tidak ubah transaksi lama)', async () => {
    mockPrisma.pengaturanUmum.findFirst.mockResolvedValue({
      linkqu_is_active: true,
      linkqu_payment_va: true,
      linkqu_client_id: 'client123',
      linkqu_client_secret: 'secret123',
      linkqu_signature_key: 'sigkey',
      linkqu_merchant_code: 'M1',
      linkqu_pin: '1234',
    });
    mockPrisma.bankLinkqu.findFirst.mockResolvedValue({ kode: '002', status: true });
    mockPrisma.member.findUnique.mockResolvedValue({
      id: 1,
      fullname: 'Budi Test',
      whatsappnumber: '081234567899',
    });
    mockPrisma.paymentGatewayTransaction.findUnique.mockResolvedValue({
      uuid: 'tx-old',
      partner_reff: 'DP-1-K1-abc',
      payment_method: 'VA',
      bank_code: '002',
      amount: 50000,
      fee_admin: 0,
      total_amount: 50000,
      status: 'PENDING',
      metadata: JSON.stringify({}),
    });

    const res = await service.processLinkquDeposit(1, {
      nominal: '20000',
      payment_method: 'VA',
      bank_code: '002',
      idempotency_key: 'K1',
    });

    expect(res.error).toBe(true);
    expect(res.error_msg).toContain('Idempotency');
    expect(mockPrisma.paymentGatewayTransaction.create).not.toHaveBeenCalled();
  });

  it('8. Timeout provider menahan PENDING dengan state AWAITING tanpa membuat tagihan baru', async () => {
    mockPrisma.pengaturanUmum.findFirst.mockResolvedValue({
      linkqu_is_active: true,
      linkqu_payment_va: true,
      linkqu_client_id: 'client123',
      linkqu_client_secret: 'secret123',
      linkqu_signature_key: 'sigkey',
      linkqu_merchant_code: 'M1',
      linkqu_pin: '1234',
    });
    mockPrisma.bankLinkqu.findFirst.mockResolvedValue({ kode: '002', status: true });
    mockPrisma.member.findUnique.mockResolvedValue({
      id: 1,
      fullname: 'Budi Test',
      whatsappnumber: '081234567899',
    });
    mockPrisma.paymentGatewayTransaction.findUnique.mockResolvedValue(null);
    mockPrisma.requestDeposit.create.mockResolvedValue({ id: 601, kode: 'DEP601' });
    mockPrisma.paymentGatewayTransaction.create.mockResolvedValue({
      id: 301,
      uuid: 'uuid-301',
      status: 'PENDING',
    });
    global.fetch = jest.fn().mockRejectedValue(new Error('ETIMEDOUT'));

    const res = await service.processLinkquDeposit(1, {
      nominal: '50000',
      payment_method: 'VA',
      bank_code: '002',
      idempotency_key: 'K2',
    });

    expect(res.error).toBe(false);
    expect(res.data.status).toBe('PENDING');
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(mockPrisma.paymentGatewayTransaction.create).toHaveBeenCalledTimes(1);
    expect(mockPrisma.paymentGatewayTransaction.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 301, status: 'PENDING' },
        data: expect.objectContaining({
          metadata: expect.stringContaining('AWAITING_PROVIDER_CONFIRMATION'),
        }),
      }),
    );
  });

  it('9. Jalur balapan P2002 tetap menolak key sama dengan nominal berbeda', async () => {
    mockPrisma.pengaturanUmum.findFirst.mockResolvedValue({
      linkqu_is_active: true,
      linkqu_payment_va: true,
      linkqu_client_id: 'client123',
      linkqu_client_secret: 'secret123',
      linkqu_signature_key: 'sigkey',
      linkqu_merchant_code: 'M1',
      linkqu_pin: '1234',
    });
    mockPrisma.bankLinkqu.findFirst.mockResolvedValue({ kode: '002', status: true });
    mockPrisma.member.findUnique.mockResolvedValue({
      id: 1,
      fullname: 'Budi Test',
      whatsappnumber: '081234567899',
    });

    // findUnique pertama (cek awal) tidak ada; findUnique kedua (setelah P2002) mengembalikan tx beda nominal.
    mockPrisma.paymentGatewayTransaction.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        uuid: 'tx-raced',
        partner_reff: 'DP-1-RACE',
        payment_method: 'VA',
        bank_code: '002',
        amount: 20000,
        fee_admin: 0,
        total_amount: 20000,
        status: 'PENDING',
        metadata: JSON.stringify({}),
      });
    mockPrisma.requestDeposit.create.mockResolvedValue({ id: 701, kode: 'DEP701' });
    mockPrisma.paymentGatewayTransaction.create.mockRejectedValue({ code: 'P2002' });

    const res = await service.processLinkquDeposit(1, {
      nominal: '50000',
      payment_method: 'VA',
      bank_code: '002',
      idempotency_key: 'RACE',
    });

    expect(res.error).toBe(true);
    expect(res.error_msg).toContain('Idempotency');
  });

  it('10. Respons provider ambigu tidak langsung dianggap gagal permanen', async () => {
    mockPrisma.pengaturanUmum.findFirst.mockResolvedValue({
      linkqu_is_active: true,
      linkqu_payment_va: true,
      linkqu_client_id: 'client123',
      linkqu_client_secret: 'secret123',
      linkqu_signature_key: 'sigkey',
      linkqu_merchant_code: 'M1',
      linkqu_pin: '1234',
    });
    mockPrisma.bankLinkqu.findFirst.mockResolvedValue({ kode: '002', status: true });
    mockPrisma.member.findUnique.mockResolvedValue({
      id: 1,
      fullname: 'Budi Test',
      whatsappnumber: '081234567899',
    });
    mockPrisma.paymentGatewayTransaction.findUnique.mockResolvedValue(null);
    mockPrisma.requestDeposit.create.mockResolvedValue({ id: 801, kode: 'DEP801' });
    mockPrisma.paymentGatewayTransaction.create.mockResolvedValue({
      id: 401,
      uuid: 'uuid-401',
      status: 'PENDING',
    });
    global.fetch = jest.fn().mockResolvedValue({
      text: jest.fn().mockResolvedValue(JSON.stringify({ response_code: '05', status: 'PENDING' })),
    } as any);

    const res = await service.processLinkquDeposit(1, {
      nominal: '50000',
      payment_method: 'VA',
      bank_code: '002',
      idempotency_key: 'AMB',
    });

    expect(res.error).toBe(false);
    expect(res.data.status).toBe('PENDING');
    expect(mockPrisma.paymentGatewayTransaction.updateMany).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'FAILED' }),
      }),
    );
  });

  it('11. Biaya negatif dari provider ditolak dan ditahan menunggu konfirmasi', async () => {
    mockPrisma.pengaturanUmum.findFirst.mockResolvedValue({
      linkqu_is_active: true,
      linkqu_payment_va: true,
      linkqu_client_id: 'client123',
      linkqu_client_secret: 'secret123',
      linkqu_signature_key: 'sigkey',
      linkqu_merchant_code: 'M1',
      linkqu_pin: '1234',
    });
    mockPrisma.bankLinkqu.findFirst.mockResolvedValue({ kode: '002', status: true });
    mockPrisma.member.findUnique.mockResolvedValue({
      id: 1,
      fullname: 'Budi Test',
      whatsappnumber: '081234567899',
    });
    mockPrisma.paymentGatewayTransaction.findUnique.mockResolvedValue(null);
    mockPrisma.requestDeposit.create.mockResolvedValue({ id: 901, kode: 'DEP901' });
    mockPrisma.paymentGatewayTransaction.create.mockResolvedValue({
      id: 501,
      uuid: 'uuid-501',
      status: 'PENDING',
    });
    global.fetch = jest.fn().mockResolvedValue({
      text: jest.fn().mockResolvedValue(
        JSON.stringify({ response_code: '00', status: 'SUCCESS', feeadmin: -5000 }),
      ),
    } as any);

    const res = await service.processLinkquDeposit(1, {
      nominal: '50000',
      payment_method: 'VA',
      bank_code: '002',
      idempotency_key: 'FEE',
    });

    expect(res.error).toBe(false);
    expect(res.data.status).toBe('PENDING');
    expect(mockPrisma.paymentGatewayTransaction.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          metadata: expect.stringContaining('INVALID_PROVIDER_FEE'),
        }),
      }),
    );
  });
});
