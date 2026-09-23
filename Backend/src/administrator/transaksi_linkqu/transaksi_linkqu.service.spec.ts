import { Test, TestingModule } from '@nestjs/testing';
import { TransaksiLinkquService } from './transaksi_linkqu.service';
import { PrismaService } from '../../prisma.service';

describe('TransaksiLinkquService - getUncreditedCandidates (C2 Factual Classification)', () => {
  let service: TransaksiLinkquService;
  let prismaMock: any;

  beforeEach(async () => {
    prismaMock = {
      paymentGatewayTransaction: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransaksiLinkquService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<TransaksiLinkquService>(TransaksiLinkquService);
  });

  it('C2-UNCREDITED-01: Mengklasifikasikan BUKTI_KREDIT_TIDAK_DITEMUKAN jika tidak ada ledger mutasi', async () => {
    prismaMock.paymentGatewayTransaction.findMany.mockResolvedValue([
      {
        id: 101,
        partner_reff: 'REFF_001',
        provider: 'LINKQU',
        amount: 50000,
        status: 'SUCCESS',
        payment_method: 'VA_PERMATA',
        settlement_ledger_id: null,
        settlementLedger: null,
        requestDeposit: {
          id: 1,
          status: 'sukses',
          nominal: 50000,
          riwayatTransaksi: {
            member: { id: 10, fullname: 'Budi Santoso' },
            riwayatSaldos: [], // KOSONG -> Tidak ada bukti mutasi kredit
          },
        },
      },
    ]);

    const result = await service.getUncreditedCandidates({});
    expect(result.data.items).toHaveLength(1);
    expect(result.data.items[0].category).toBe('BUKTI_KREDIT_TIDAK_DITEMUKAN');
    expect(result.data.items[0].partner_reff).toBe('REFF_001');
  });

  it('C2-UNCREDITED-02: Mengklasifikasikan BUKTI_KREDIT_AMBIGU jika terdapat >1 mutasi saldo pada riwayat transaksi', async () => {
    prismaMock.paymentGatewayTransaction.findMany.mockResolvedValue([
      {
        id: 102,
        partner_reff: 'REFF_002',
        provider: 'LINKQU',
        amount: 50000,
        status: 'SUCCESS',
        payment_method: 'VA_PERMATA',
        settlement_ledger_id: null,
        settlementLedger: null,
        requestDeposit: {
          id: 2,
          status: 'sukses',
          nominal: 50000,
          riwayatTransaksi: {
            member: { id: 11, fullname: 'Siti Aminah' },
            riwayatSaldos: [
              { id: 201, status: 'deposit', nominal: 50000 },
              { id: 202, status: 'deposit', nominal: 50000 }, // DUA MUTASI SALDO -> Ambigu!
            ],
          },
        },
      },
    ]);

    const result = await service.getUncreditedCandidates({});
    expect(result.data.items).toHaveLength(1);
    expect(result.data.items[0].category).toBe('BUKTI_KREDIT_AMBIGU');
  });

  it('C2-UNCREDITED-03: Mengklasifikasikan MISSING_DEPOSIT_RELATION jika requestDeposit bernilai null', async () => {
    prismaMock.paymentGatewayTransaction.findMany.mockResolvedValue([
      {
        id: 103,
        partner_reff: 'REFF_003',
        provider: 'LINKQU',
        amount: 75000,
        status: 'SUCCESS',
        payment_method: 'QRIS',
        settlement_ledger_id: null,
        settlementLedger: null,
        requestDeposit: null, // RELASI REQUEST DEPOSIT HILANG
      },
    ]);

    const result = await service.getUncreditedCandidates({});
    expect(result.data.items).toHaveLength(1);
    expect(result.data.items[0].category).toBe('MISSING_DEPOSIT_RELATION');
  });

  it('C2-UNCREDITED-04: Mengklasifikasikan DEPOSIT_STATUS_MISMATCH jika status deposit masih proses', async () => {
    prismaMock.paymentGatewayTransaction.findMany.mockResolvedValue([
      {
        id: 104,
        partner_reff: 'REFF_004',
        provider: 'LINKQU',
        amount: 100000,
        status: 'SUCCESS', // Gateway SUCCESS
        payment_method: 'QRIS',
        settlement_ledger_id: null,
        settlementLedger: null,
        requestDeposit: {
          id: 4,
          status: 'proses', // Deposit masih 'proses' -> MISMATCH!
          nominal: 100000,
          riwayatTransaksi: {
            member: { id: 12, fullname: 'Joko Anwar' },
            riwayatSaldos: [],
          },
        },
      },
    ]);

    const result = await service.getUncreditedCandidates({});
    expect(result.data.items).toHaveLength(1);
    expect(result.data.items[0].category).toBe('DEPOSIT_STATUS_MISMATCH');
  });

  it('C2-UNCREDITED-05: Mengklasifikasikan MISSING_MEMBER_RELATION jika member bernilai null', async () => {
    prismaMock.paymentGatewayTransaction.findMany.mockResolvedValue([
      {
        id: 105,
        partner_reff: 'REFF_005',
        provider: 'LINKQU',
        amount: 25000,
        status: 'SUCCESS',
        payment_method: 'VA_BRI',
        settlement_ledger_id: null,
        settlementLedger: null,
        requestDeposit: {
          id: 5,
          status: 'sukses',
          nominal: 25000,
          riwayatTransaksi: {
            member: null, // MEMBER NULL!
            riwayatSaldos: [],
          },
        },
      },
    ]);

    const result = await service.getUncreditedCandidates({});
    expect(result.data.items).toHaveLength(1);
    expect(result.data.items[0].category).toBe('MISSING_MEMBER_RELATION');
  });

  it('C2-UNCREDITED-06: Mengabaikan transaksi yang sudah memiliki settlement_ledger_id valid', async () => {
    prismaMock.paymentGatewayTransaction.findMany.mockResolvedValue([
      {
        id: 106,
        partner_reff: 'REFF_006',
        provider: 'LINKQU',
        amount: 50000,
        status: 'SUCCESS',
        payment_method: 'VA_PERMATA',
        settlement_ledger_id: 301, // SUDAH MEMILIKI SETTLEMENT LEDGER!
        settlementLedger: { id: 301, settlement_ref: 'SETTLE-LINKQU-REFF_006' },
        requestDeposit: {
          id: 6,
          status: 'sukses',
          nominal: 50000,
          riwayatTransaksi: {
            member: { id: 15, fullname: 'Rian D' },
            riwayatSaldos: [{ id: 301, status: 'deposit', nominal: 50000 }],
          },
        },
      },
    ]);

    const result = await service.getUncreditedCandidates({});
    expect(result.data.items).toHaveLength(0); // Bersih, bukan kandidat anomali!
  });

  it('C2-UNCREDITED-07: Paginasi dan meta data dihitung dengan benar', async () => {
    // 3 item anomali
    prismaMock.paymentGatewayTransaction.findMany.mockResolvedValue([
      {
        id: 1,
        partner_reff: 'R1',
        provider: 'LINKQU',
        amount: 10000,
        status: 'SUCCESS',
        requestDeposit: null,
      },
      {
        id: 2,
        partner_reff: 'R2',
        provider: 'LINKQU',
        amount: 20000,
        status: 'SUCCESS',
        requestDeposit: null,
      },
      {
        id: 3,
        partner_reff: 'R3',
        provider: 'LINKQU',
        amount: 30000,
        status: 'SUCCESS',
        requestDeposit: null,
      },
    ]);

    const result = await service.getUncreditedCandidates({ page: 2, limit: 2 });
    expect(result.data.meta.total).toBe(3);
    expect(result.data.meta.page).toBe(2);
    expect(result.data.meta.per_page).toBe(2);
    expect(result.data.meta.total_pages).toBe(2);
    expect(result.data.items).toHaveLength(1);
    expect(result.data.items[0].partner_reff).toBe('R3');
  });
});
