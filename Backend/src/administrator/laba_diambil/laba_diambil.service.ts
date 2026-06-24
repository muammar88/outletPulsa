import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class LabaDiambilService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: string, limit: number, page: number) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query) {
      where.kode_invoice = {
        contains: query,
        mode: 'insensitive',
      };
    }

    const [list, total] = await Promise.all([
      this.prisma.takeLaba.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.takeLaba.count({ where }),
    ]);

    return { list, total };
  }

  async getSummaryUnpaid() {
    const [transaksiPulsa, transaksiPascabayar] = await Promise.all([
      this.prisma.transaction.aggregate({
        _sum: { laba: true },
        _count: { id: true },
        where: { status_laba: 'unpaid' },
      }),
      this.prisma.transactionPascabayar.aggregate({
        _sum: { laba: true },
        _count: { id: true },
        where: { status_laba: 'unpaid' },
      }),
    ]);

    const totalLaba =
      (transaksiPulsa._sum.laba || 0) + (transaksiPascabayar._sum.laba || 0);
    const totalTransaksi =
      (transaksiPulsa._count.id || 0) + (transaksiPascabayar._count.id || 0);

    return {
      totalLaba,
      totalTransaksi,
    };
  }

  async takeLaba() {
    return await this.prisma.$transaction(async (prisma) => {
      // 1. Hitung total laba & transaksi unpaid secara real-time di dalam transaksi
      const [transaksiPulsa, transaksiPascabayar] = await Promise.all([
        prisma.transaction.aggregate({
          _sum: { laba: true },
          _count: { id: true },
          where: { status_laba: 'unpaid' },
        }),
        prisma.transactionPascabayar.aggregate({
          _sum: { laba: true },
          _count: { id: true },
          where: { status_laba: 'unpaid' },
        }),
      ]);

      const totalLaba =
        (transaksiPulsa._sum.laba || 0) + (transaksiPascabayar._sum.laba || 0);
      const totalTransaksi =
        (transaksiPulsa._count.id || 0) + (transaksiPascabayar._count.id || 0);

      if (totalLaba === 0) {
        throw new BadRequestException('Tidak ada laba unpaid yang dapat diambil.');
      }

      // 2. Generate kode_invoice unik
      const dateStr = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
      const randomStr = Math.floor(1000 + Math.random() * 9000);
      const kode_invoice = `WD-LABA-${dateStr}-${randomStr}`;

      // 3. Simpan riwayat pengambilan laba
      const takeLaba = await prisma.takeLaba.create({
        data: {
          kode_invoice,
          jumlah_laba: totalLaba,
          jumlah_transaksi: totalTransaksi,
        },
      });

      // 4. Update status laba di tabel Transaction
      await prisma.transaction.updateMany({
        where: { status_laba: 'unpaid' },
        data: { status_laba: 'paid' },
      });

      // 5. Update status laba di tabel TransactionPascabayar
      await prisma.transactionPascabayar.updateMany({
        where: { status_laba: 'unpaid' },
        data: { status_laba: 'paid' },
      });

      return takeLaba;
    });
  }
}
