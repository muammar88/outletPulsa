import { Test, TestingModule } from "@nestjs/testing";
import { TransaksiFinalizerService } from "./transaksi-finalizer.service";
import { PrismaService } from "../../prisma.service";
import { PengumumanService } from "../../pengumuman/pengumuman.service";
import { SocketService } from "../../socket/socket.service";

describe("ISSUE-001: TransaksiFinalizerService", () => {
  let service: TransaksiFinalizerService;
  let prismaMock: any;
  let pengumumanMock: any;
  let socketMock: any;

  beforeEach(async () => {
    prismaMock = {
      transaction: {
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      member: {
        update: jest.fn(),
      },
      riwayatSaldo: {
        create: jest.fn(),
      },
      riwayatTransaksi: {
        create: jest.fn(),
      },
      activityLog: {
        create: jest.fn().mockResolvedValue({ id: 999 }),
      },
      $transaction: jest.fn(async (cb: any) => cb(prismaMock)),
    };
    pengumumanMock = { sendTransactionStatus: jest.fn().mockResolvedValue(true) };
    socketMock = { emitTransactionUpdated: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransaksiFinalizerService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: PengumumanService, useValue: pengumumanMock },
        { provide: SocketService, useValue: socketMock },
      ],
    }).compile();
    service = module.get<TransaksiFinalizerService>(TransaksiFinalizerService);
  });

  function makeTrx(overrides: any = {}) {
    return {
      id: 1, kode: "TRX001", status: "proses",
      selling_price: 10000, fee_agen: 20, purchase_price: 9800,
      nomorTujuan: "08123456789", riwayatTransaksiId: 10,
      saldo_sebelum: 100000, saldo_sesudah: 89980,
      refund_id: null, serial_number: null,
      riwayatTransaksi: { member: { id: 5, saldo: 90000 } },
      produk: { name: "Telkomsel 10K" }, server: null,
      ...overrides,
    };
  }

  it("harus berhasil finalisasi gagal dan melakukan refund tepat satu kali", async () => {
    prismaMock.transaction.findUnique.mockResolvedValue(makeTrx());
    prismaMock.transaction.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.member.update.mockResolvedValue({ id: 5, saldo: 100020 });
    const result = await service.finalizeTransaction({ transactionId: 1, targetStatus: "gagal", source: "TEST" });
    expect(result.finalized).toBe(true);
    expect(result.refundAmount).toBe(10020);
    expect(prismaMock.member.update).toHaveBeenCalledWith({ where: { id: 5 }, data: { saldo: { increment: 10020 } } });
    expect(prismaMock.riwayatSaldo.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ kode: "REFUND-TRX-1", nominal: 10020 }) })
    );
  });

  it("harus mencegah refund ganda saat 10 pemanggilan paralel/berulang", async () => {
    let callCount = 0;
    prismaMock.transaction.findUnique.mockResolvedValue(makeTrx({ id: 2, kode: "TRX002" }));
    prismaMock.transaction.updateMany.mockImplementation(async () => ({ count: ++callCount === 1 ? 1 : 0 }));
    prismaMock.member.update.mockResolvedValue({ id: 5, saldo: 100000 });
    const results = await Promise.all(
      Array.from({ length: 10 }, (_, i) => service.finalizeTransaction({ transactionId: 2, targetStatus: "gagal", source: `P${i}` }))
    );
    expect(results.filter((r) => r.finalized).length).toBe(1);
    expect(prismaMock.member.update).toHaveBeenCalledTimes(1);
    expect(prismaMock.riwayatSaldo.create).toHaveBeenCalledTimes(1);
  });

  it("harus konsisten pada sukses berulang tanpa melakukan refund", async () => {
    prismaMock.transaction.findUnique.mockResolvedValue(makeTrx({ id: 3, kode: "TRX003", selling_price: 15000, fee_agen: 50 }));
    prismaMock.transaction.updateMany.mockResolvedValue({ count: 1 });
    const result = await service.finalizeTransaction({ transactionId: 3, targetStatus: "sukses", sn: "SN123456789", actualPurchasePrice: 13900 });
    expect(result.finalized).toBe(true);
    expect(prismaMock.member.update).not.toHaveBeenCalled();
    expect(prismaMock.transaction.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "sukses", purchase_price: 13900, laba: 1050, serial_number: "SN123456789" }) })
    );
  });

  it("tidak boleh otomatis merefund jika transaksi sudah sukses lalu tiba callback gagal", async () => {
    prismaMock.transaction.findUnique.mockResolvedValue(makeTrx({ id: 4, status: "sukses" }));
    const result = await service.finalizeTransaction({ transactionId: 4, targetStatus: "gagal", source: "LATE" });
    expect(result.finalized).toBe(false);
    expect(result.alreadyFinal).toBe(true);
    expect(result.status).toBe("sukses");
    expect(prismaMock.member.update).not.toHaveBeenCalled();
    expect(prismaMock.activityLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ action: "TRANSACTION_STATUS_CONFLICT", entityId: "4" }) })
    );
  });

  describe("B2: Refund unik dan bukti debit", () => {
    it("B2-01: refund_id sudah ada => refund kedua dibatalkan (idempoten)", async () => {
      prismaMock.transaction.findUnique.mockResolvedValue(makeTrx({ id: 10, refund_id: "REFUND-TRX-10" }));
      prismaMock.transaction.updateMany.mockResolvedValue({ count: 1 });
      const result = await service.finalizeTransaction({ transactionId: 10, targetStatus: "gagal", source: "DUPE" });
      expect(result.finalized).toBe(true);
      expect(result.refundAmount).toBe(0);
      expect(prismaMock.member.update).not.toHaveBeenCalled();
      expect(prismaMock.riwayatSaldo.create).not.toHaveBeenCalled();
    });

    it("B2-02: tanpa bukti debit (saldo_sebelum null) => refund 0, activityLog dicatat", async () => {
      prismaMock.transaction.findUnique.mockResolvedValue(makeTrx({ id: 11, saldo_sebelum: null, saldo_sesudah: null }));
      prismaMock.transaction.updateMany.mockResolvedValue({ count: 1 });
      const result = await service.finalizeTransaction({ transactionId: 11, targetStatus: "gagal", source: "NO_DEBIT" });
      expect(result.finalized).toBe(true);
      expect(result.refundAmount).toBe(0);
      expect(prismaMock.member.update).not.toHaveBeenCalled();
      expect(prismaMock.activityLog.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ action: "REFUND_DITOLAK_TANPA_BUKTI_DEBIT", entityId: "11" }) })
      );
    });

    it("B2-03: saldo_sebelum <= saldo_sesudah (tidak ada pengurangan) => refund 0", async () => {
      prismaMock.transaction.findUnique.mockResolvedValue(makeTrx({ id: 12, saldo_sebelum: 50000, saldo_sesudah: 50000 }));
      prismaMock.transaction.updateMany.mockResolvedValue({ count: 1 });
      const result = await service.finalizeTransaction({ transactionId: 12, targetStatus: "gagal" });
      expect(result.finalized).toBe(true);
      expect(result.refundAmount).toBe(0);
      expect(prismaMock.member.update).not.toHaveBeenCalled();
    });

    it("B2-04: relasi member wajib hilang => $transaction rollback, throw error", async () => {
      prismaMock.transaction.findUnique.mockResolvedValue(makeTrx({ id: 13, riwayatTransaksi: { member: null } }));
      prismaMock.transaction.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.$transaction.mockImplementationOnce(async (cb: any) => cb(prismaMock));
      await expect(service.finalizeTransaction({ transactionId: 13, targetStatus: "gagal", source: "MISSING_REL" })).rejects.toThrow();
      expect(prismaMock.member.update).not.toHaveBeenCalled();
      expect(prismaMock.riwayatSaldo.create).not.toHaveBeenCalled();
    });

    it("B2-05: riwayatSaldo.create gagal => $transaction rollback, throw error", async () => {
      prismaMock.transaction.findUnique.mockResolvedValue(makeTrx({ id: 14 }));
      prismaMock.transaction.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.member.update.mockResolvedValue({ id: 5, saldo: 100020 });
      prismaMock.riwayatSaldo.create.mockRejectedValueOnce(new Error("Unique constraint on kode"));
      prismaMock.$transaction.mockImplementationOnce(async (cb: any) => cb(prismaMock));
      await expect(service.finalizeTransaction({ transactionId: 14, targetStatus: "gagal", source: "LEDGER_FAIL" })).rejects.toThrow();
    });

    it("B2-06: actualPurchasePrice dari provider => laba dihitung dengan harga aktual", async () => {
      prismaMock.transaction.findUnique.mockResolvedValue(makeTrx({ id: 15, selling_price: 20000, purchase_price: 18000, fee_agen: 100, saldo_sesudah: 99900 }));
      prismaMock.transaction.updateMany.mockResolvedValue({ count: 1 });
      await service.finalizeTransaction({ transactionId: 15, targetStatus: "sukses", sn: "SN-XYZ", actualPurchasePrice: 17500 });
      // Laba = 20000 - 17500 - 100 = 2400
      expect(prismaMock.transaction.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ purchase_price: 17500, laba: 2400 }) })
      );
    });

    it("B2-07: kode ledger refund sama dengan refund_id => deterministik REFUND-TRX-{id}", async () => {
      prismaMock.transaction.findUnique.mockResolvedValue(makeTrx({ id: 20, kode: "TRX020", selling_price: 25000, fee_agen: 50, saldo_sebelum: 200000, saldo_sesudah: 174950 }));
      prismaMock.transaction.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.member.update.mockResolvedValue({ id: 5, saldo: 200000 });
      const result = await service.finalizeTransaction({ transactionId: 20, targetStatus: "gagal" });
      expect(result.refundAmount).toBe(25050);
      expect(prismaMock.transaction.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ refund_id: "REFUND-TRX-20" }) })
      );
      expect(prismaMock.riwayatSaldo.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ kode: "REFUND-TRX-20", nominal: 25050 }) })
      );
    });
  });
});
