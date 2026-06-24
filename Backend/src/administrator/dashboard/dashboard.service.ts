import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStatistics() {
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    // Total Pendapatan Keseluruhan (Laba Belum Dicairkan)
    const [
      revenueUnpaidPrabayar,
      revenueUnpaidPascabayar,
    ] = await Promise.all([
      this.prisma.transaction.aggregate({
        _sum: { laba: true },
        where: { status: 'sukses', status_laba: 'unpaid' }
      }),
      this.prisma.transactionPascabayar.aggregate({
        _sum: { laba: true },
        where: { status: 'sukses', status_laba: 'unpaid' }
      }),
    ]);

    const revThis = (revenueUnpaidPrabayar._sum.laba || 0) + (revenueUnpaidPascabayar._sum.laba || 0);
    const revTrend = 0; // Tidak ada trend untuk nilai kumulatif keseluruhan

    // Total Transaksi
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const [
      trxTotalPrabayar,
      trxTotalPascabayar,
      trxTodayPrabayar,
      trxTodayPascabayar,
      trxThisMonthPrabayar,
      trxThisMonthPascabayar,
      trxLastMonthPrabayar,
      trxLastMonthPascabayar,
    ] = await Promise.all([
      this.prisma.transaction.count({ where: { status: 'sukses' } }),
      this.prisma.transactionPascabayar.count({ where: { status: 'sukses' } }),
      this.prisma.transaction.count({ where: { status: 'sukses', createdAt: { gte: today } } }),
      this.prisma.transactionPascabayar.count({ where: { status: 'sukses', createdAt: { gte: today } } }),
      this.prisma.transaction.count({ where: { status: 'sukses', createdAt: { gte: firstDayThisMonth } } }),
      this.prisma.transactionPascabayar.count({ where: { status: 'sukses', createdAt: { gte: firstDayThisMonth } } }),
      this.prisma.transaction.count({ where: { status: 'sukses', createdAt: { gte: firstDayLastMonth, lt: firstDayThisMonth } } }),
      this.prisma.transactionPascabayar.count({ where: { status: 'sukses', createdAt: { gte: firstDayLastMonth, lt: firstDayThisMonth } } }),
    ]);

    const trxTotal = trxTotalPrabayar + trxTotalPascabayar;
    const trxToday = trxTodayPrabayar + trxTodayPascabayar;
    const trxThisMonth = trxThisMonthPrabayar + trxThisMonthPascabayar;
    const trxLastMonth = trxLastMonthPrabayar + trxLastMonthPascabayar;
    const trxTrend = trxLastMonth === 0 ? 100 : ((trxThisMonth - trxLastMonth) / trxLastMonth) * 100;

    // Member Aktif
    const [
      memberTotal,
      memberThisMonth,
      memberLastMonth,
    ] = await Promise.all([
      this.prisma.member.count({ where: { status: 'verfied' } }),
      this.prisma.member.count({ where: { status: 'verfied', createdAt: { gte: firstDayThisMonth } } }),
      this.prisma.member.count({ where: { status: 'verfied', createdAt: { gte: firstDayLastMonth, lt: firstDayThisMonth } } }),
    ]);

    const memberTrend = memberLastMonth === 0 ? 100 : ((memberThisMonth - memberLastMonth) / memberLastMonth) * 100;

    // Produk Aktif
    const [
      produkPrabayarActive,
      produkPascabayarActive,
      produkPrabayarLastMonth,
      produkPascabayarLastMonth,
    ] = await Promise.all([
      this.prisma.produk.count({ where: { status: 'active' } }),
      this.prisma.produkPascabayar.count({ where: { status: 'active' } }),
      this.prisma.produk.count({ where: { status: 'active', createdAt: { lt: firstDayThisMonth } } }),
      this.prisma.produkPascabayar.count({ where: { status: 'active', createdAt: { lt: firstDayThisMonth } } }),
    ]);

    const produkActiveTotal = produkPrabayarActive + produkPascabayarActive;
    const produkActiveLastMonth = produkPrabayarLastMonth + produkPascabayarLastMonth;
    const produkTrend = produkActiveLastMonth === 0 ? 0 : ((produkActiveTotal - produkActiveLastMonth) / produkActiveLastMonth) * 100;

    return {
      revenue: {
        value: revThis,
        trend: revTrend,
        trendUp: revTrend >= 0,
      },
      transactions: {
        value: trxTotal,
        today: trxToday,
        trend: trxTrend,
        trendUp: trxTrend >= 0,
      },
      members: {
        value: memberTotal,
        newThisMonth: memberThisMonth,
        trend: memberTrend,
        trendUp: memberTrend >= 0,
      },
      products: {
        value: produkActiveTotal,
        prabayar: produkPrabayarActive,
        pascabayar: produkPascabayarActive,
        trend: produkTrend,
        trendUp: produkTrend >= 0,
      }
    };
  }

  async getRecentTransactions() {
    const trx = await this.prisma.transaction.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        produk: true
      }
    });

    const mapped = trx.map(t => ({
      id: t.id,
      name: t.produk?.name || t.ket || 'Transaksi',
      time: t.createdAt.toISOString(),
      amount: t.selling_price || 0,
      status: t.status,
      type: 'prabayar'
    }));

    return mapped;
  }

  async getTopProducts() {
    const grouped = await this.prisma.transaction.groupBy({
      by: ['produkId'],
      _count: { produkId: true },
      orderBy: { _count: { produkId: 'desc' } },
      take: 4,
    });

    // Total transactions for percentage
    const totalTransactions = await this.prisma.transaction.count();

    const topProdukIds = grouped.map(g => g.produkId).filter(id => id !== null) as number[];
    let products: any[] = [];
    if (topProdukIds.length > 0) {
      products = await this.prisma.produk.findMany({
        where: { id: { in: topProdukIds } },
      });
    }

    const colors = [
      'linear-gradient(90deg, #2563eb, #6366f1)',
      'linear-gradient(90deg, #059669, #34d399)',
      'linear-gradient(90deg, #d97706, #fbbf24)',
      'linear-gradient(90deg, #7c3aed, #a78bfa)',
    ];

    return grouped.map((g, index) => {
      const prod = products.find(p => p.id === g.produkId);
      const count = g._count.produkId || 0;
      const percent = totalTransactions > 0 ? (count / totalTransactions) * 100 : 0;
      
      return {
        name: prod?.name || 'Unknown',
        count,
        percent: Math.round(percent),
        color: colors[index % colors.length]
      };
    });
  }

  async getSystemStatus() {
    let dbOk = true;
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbOk = false;
    }

    return [
      { name: 'API Gateway', ok: true },
      { name: 'Database', ok: dbOk },
      { name: 'Payment Gateway', ok: true },
      { name: 'Notifikasi SMS', ok: false }, // Placeholder for actual check
    ];
  }
}
