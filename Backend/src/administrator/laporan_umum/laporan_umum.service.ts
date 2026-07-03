import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import moment from 'moment';

@Injectable()
export class LaporanUmumService {
  constructor(private readonly prisma: PrismaService) {}

  private parseDateRange(startDate?: string, endDate?: string) {
    let start: Date;
    let end: Date;

    if (startDate && endDate) {
      start = moment(startDate).startOf('day').toDate();
      end = moment(endDate).endOf('day').toDate();
    } else {
      // Default to this month
      start = moment().startOf('month').toDate();
      end = moment().endOf('day').toDate();
    }

    return { start, end };
  }

  async getSummary(startDateParam?: string, endDateParam?: string) {
    const { start: filterStart, end: filterEnd } = this.parseDateRange(startDateParam, endDateParam);
    
    const todayStart = moment().startOf('day').toDate();
    const weekStart = moment().startOf('isoWeek').toDate(); // Monday
    const monthStart = moment().startOf('month').toDate();
    const yearStart = moment().startOf('year').toDate();

    // 1. Ringkasan Member
    const [
      totalMember,
      activeMember,
      inactiveMember,
      newMemberFiltered,
      newMemberToday,
      newMemberWeek,
      newMemberMonth,
      newMemberYear
    ] = await Promise.all([
      this.prisma.member.count(),
      this.prisma.member.count({ where: { status: 'verfied' } }),
      this.prisma.member.count({ where: { status: 'unverified' } }),
      this.prisma.member.count({ where: { createdAt: { gte: filterStart, lte: filterEnd } } }),
      this.prisma.member.count({ where: { createdAt: { gte: todayStart } } }),
      this.prisma.member.count({ where: { createdAt: { gte: weekStart } } }),
      this.prisma.member.count({ where: { createdAt: { gte: monthStart } } }),
      this.prisma.member.count({ where: { createdAt: { gte: yearStart } } }),
    ]);

    const memberSummary = {
      total: totalMember,
      active: activeMember,
      inactive: inactiveMember,
      newFiltered: newMemberFiltered,
      newToday: newMemberToday,
      newWeek: newMemberWeek,
      newMonth: newMemberMonth,
      newYear: newMemberYear
    };

    // 2. Ringkasan Saldo
    const totalSaldoResult = await this.prisma.member.aggregate({ _sum: { saldo: true } });
    const totalSaldo = totalSaldoResult._sum.saldo || 0;

    // Saldo used (Transaction Prabayar + Pascabayar Success in range)
    const [saldoUsedPrabayar, saldoUsedPascabayar] = await Promise.all([
      this.prisma.transaction.aggregate({
        _sum: { selling_price: true },
        where: { status: 'sukses', createdAt: { gte: filterStart, lte: filterEnd } }
      }),
      this.prisma.transactionPascabayar.aggregate({
        _sum: { total: true },
        where: { status: 'sukses', createdAt: { gte: filterStart, lte: filterEnd } }
      })
    ]);
    const totalSaldoUsed = (saldoUsedPrabayar._sum.selling_price || 0) + (saldoUsedPascabayar._sum.total || 0);

    // Deposit Summary (in date range)
    const [depositSuccess, depositPending, depositFailed] = await Promise.all([
      this.prisma.requestDeposit.aggregate({
        _sum: { nominal: true },
        where: { status: 'sukses', createdAt: { gte: filterStart, lte: filterEnd } }
      }),
      this.prisma.requestDeposit.aggregate({
        _sum: { nominal: true },
        where: { status: 'proses', createdAt: { gte: filterStart, lte: filterEnd } }
      }),
      this.prisma.requestDeposit.aggregate({
        _sum: { nominal: true },
        where: { status: 'gagal', createdAt: { gte: filterStart, lte: filterEnd } }
      })
    ]);

    const saldoSummary = {
      totalSaldo,
      totalSaldoUsed,
      depositSuccess: depositSuccess._sum.nominal || 0,
      depositPending: depositPending._sum.nominal || 0,
      depositFailed: depositFailed._sum.nominal || 0,
      totalNominalDeposit: (depositSuccess._sum.nominal || 0) + (depositPending._sum.nominal || 0) + (depositFailed._sum.nominal || 0)
    };

    // 3. Ringkasan Transaksi
    // We need total, today, week, month, year for all transactions (Prabayar + Pascabayar)
    // To avoid too many queries, we group them.
    const [
      txPrabayarStats,
      txPascabayarStats
    ] = await Promise.all([
      // Prabayar in range
      this.prisma.transaction.groupBy({
        by: ['status'],
        where: { createdAt: { gte: filterStart, lte: filterEnd } },
        _count: { id: true },
        _sum: { selling_price: true, laba: true }
      }),
      // Pascabayar in range
      this.prisma.transactionPascabayar.groupBy({
        by: ['status'],
        where: { createdAt: { gte: filterStart, lte: filterEnd } },
        _count: { id: true },
        _sum: { total: true, laba: true }
      })
    ]);

    const prabayarFormatted = this.formatTxGroup(txPrabayarStats, 'selling_price');
    const pascabayarFormatted = this.formatTxGroup(txPascabayarStats, 'total');
    
    // Deposit in range
    const txDepositStats = await this.prisma.requestDeposit.groupBy({
      by: ['status'],
      where: { createdAt: { gte: filterStart, lte: filterEnd } },
      _count: { id: true },
      _sum: { nominal: true }
    });
    
    const depositFormatted = this.formatDepositGroup(txDepositStats);

    const transactionSummary = {
      prabayar: prabayarFormatted,
      pascabayar: pascabayarFormatted,
      deposit: depositFormatted,
      totalAll: prabayarFormatted.totalCount + pascabayarFormatted.totalCount + depositFormatted.totalCount,
      totalSuccessAll: prabayarFormatted.totalSuccess + pascabayarFormatted.totalSuccess + depositFormatted.totalSuccess,
      totalNominalAll: prabayarFormatted.totalNominal + pascabayarFormatted.totalNominal + depositFormatted.totalNominal,
      totalLabaAll: prabayarFormatted.totalLaba + pascabayarFormatted.totalLaba
    };

    // 4. Charts Data
    // Daily Transactions (last 30 days based on end date)
    const last30DaysStart = moment(filterEnd).subtract(30, 'days').startOf('day').toDate();
    const dailyTxRaw = await this.prisma.$queryRaw<any[]>`
      SELECT DATE(t."createdAt") as date, COUNT(t.id) as count, SUM(t.selling_price) as nominal, SUM(t.laba) as laba
      FROM "Transaction" t
      WHERE t."createdAt" >= ${last30DaysStart} AND t."createdAt" <= ${filterEnd} AND t.status = 'sukses'
      GROUP BY DATE(t."createdAt")
      ORDER BY DATE(t."createdAt") ASC
    `;
    const dailyTxPascaRaw = await this.prisma.$queryRaw<any[]>`
      SELECT DATE(t."createdAt") as date, COUNT(t.id) as count, SUM(t.total) as nominal, SUM(t.laba) as laba
      FROM "TransactionPascabayar" t
      WHERE t."createdAt" >= ${last30DaysStart} AND t."createdAt" <= ${filterEnd} AND t.status = 'sukses'
      GROUP BY DATE(t."createdAt")
      ORDER BY DATE(t."createdAt") ASC
    `;

    // Monthly Transactions (grouped by month for the current year)
    const thisYearStart = moment().startOf('year').toDate();
    const monthlyTxRaw = await this.prisma.$queryRaw<any[]>`
      SELECT DATE_TRUNC('month', t."createdAt") as month, COUNT(t.id) as count, SUM(t.selling_price) as nominal, SUM(t.laba) as laba
      FROM "Transaction" t
      WHERE t."createdAt" >= ${thisYearStart} AND t.status = 'sukses'
      GROUP BY DATE_TRUNC('month', t."createdAt")
      ORDER BY month ASC
    `;
    const monthlyTxPascaRaw = await this.prisma.$queryRaw<any[]>`
      SELECT DATE_TRUNC('month', t."createdAt") as month, COUNT(t.id) as count, SUM(t.total) as nominal, SUM(t.laba) as laba
      FROM "TransactionPascabayar" t
      WHERE t."createdAt" >= ${thisYearStart} AND t.status = 'sukses'
      GROUP BY DATE_TRUNC('month', t."createdAt")
      ORDER BY month ASC
    `;

    // Monthly Deposit
    const monthlyDepositRaw = await this.prisma.$queryRaw<any[]>`
      SELECT DATE_TRUNC('month', t."createdAt") as month, COUNT(t.id) as count, SUM(t.nominal) as nominal
      FROM "RequestDeposit" t
      WHERE t."createdAt" >= ${thisYearStart} AND t.status = 'sukses'
      GROUP BY DATE_TRUNC('month', t."createdAt")
      ORDER BY month ASC
    `;

    // Success vs Failed (Prabayar)
    const statusComparison = await this.prisma.transaction.groupBy({
      by: ['status'],
      where: { createdAt: { gte: filterStart, lte: filterEnd } },
      _count: { id: true }
    });

    const charts = {
      dailyTx: this.mergeDailyData(dailyTxRaw, dailyTxPascaRaw),
      monthlyTx: this.mergeDailyData(monthlyTxRaw, monthlyTxPascaRaw),
      monthlyDeposit: monthlyDepositRaw.map(d => ({ month: moment(d.month).format('YYYY-MM'), count: Number(d.count), nominal: Number(d.nominal) })),
      statusComparison: statusComparison.map(s => ({ status: s.status, count: s._count.id }))
    };

    return {
      memberSummary,
      saldoSummary,
      transactionSummary,
      charts
    };
  }

  async getTableData(params: { page?: string, limit?: string, search?: string, startDate?: string, endDate?: string, type?: string }) {
    const page = parseInt(params.page || '1', 10);
    const limit = parseInt(params.limit || '10', 10);
    const skip = (page - 1) * limit;
    
    const { start, end } = this.parseDateRange(params.startDate, params.endDate);
    const typeFilter = params.type || 'all'; // prabayar, pascabayar, deposit, all

    // We will use raw SQL to UNION ALL the 3 tables and apply pagination, because Prisma doesn't support UNION natively.
    // If search is provided, we search by invoice, target, or member code.
    const searchParam = params.search ? `%${params.search}%` : '%';
    
    // We will construct the raw query carefully.
    let typeCondition = '';
    if (typeFilter === 'prabayar') typeCondition = `AND type = 'Prabayar'`;
    if (typeFilter === 'pascabayar') typeCondition = `AND type = 'Pascabayar'`;
    if (typeFilter === 'deposit') typeCondition = `AND type = 'Deposit'`;

    const rawQuery = `
      WITH CombinedData AS (
        SELECT 
          t.id as id,
          t."createdAt" as date,
          t.kode as invoice,
          m.fullname as member,
          m.kode as member_kode,
          'Prabayar' as type,
          p.name as produk,
          t."nomorTujuan" as tujuan,
          t.selling_price as harga,
          t.laba as keuntungan,
          t.status as status
        FROM "Transaction" t
        LEFT JOIN "RiwayatTransaksi" rt ON t."riwayatTransaksiId" = rt.id
        LEFT JOIN "Member" m ON rt."memberId" = m.id
        LEFT JOIN "Produk" p ON t."produkId" = p.id
        WHERE t."createdAt" >= $1 AND t."createdAt" <= $2
        
        UNION ALL
        
        SELECT 
          tp.id as id,
          tp."createdAt" as date,
          tp."trId" as invoice,
          m.fullname as member,
          m.kode as member_kode,
          'Pascabayar' as type,
          pp.name as produk,
          tp."nomorTujuan" as tujuan,
          tp.total as harga,
          tp.laba as keuntungan,
          tp.status as status
        FROM "TransactionPascabayar" tp
        LEFT JOIN "RiwayatTransaksi" rt ON tp."riwayatTransaksiId" = rt.id
        LEFT JOIN "Member" m ON rt."memberId" = m.id
        LEFT JOIN "ProdukPascabayar" pp ON tp."produkId" = pp.id
        WHERE tp."createdAt" >= $1 AND tp."createdAt" <= $2
        
        UNION ALL
        
        SELECT 
          d.id as id,
          d."createdAt" as date,
          d.kode as invoice,
          m.fullname as member,
          m.kode as member_kode,
          'Deposit' as type,
          'Top Up Saldo' as produk,
          '-' as tujuan,
          d.nominal as harga,
          0 as keuntungan,
          d.status as status
        FROM "RequestDeposit" d
        LEFT JOIN "RiwayatTransaksi" rt ON d."riwayatTransaksiId" = rt.id
        LEFT JOIN "Member" m ON rt."memberId" = m.id
        WHERE d."createdAt" >= $1 AND d."createdAt" <= $2
      )
      SELECT * FROM CombinedData
      WHERE (invoice ILIKE $3 OR member ILIKE $3 OR tujuan ILIKE $3 OR member_kode ILIKE $3)
      ${typeFilter !== 'all' ? `AND type = '${typeFilter === 'prabayar' ? 'Prabayar' : typeFilter === 'pascabayar' ? 'Pascabayar' : 'Deposit'}'` : ''}
      ORDER BY date DESC
      LIMIT $4 OFFSET $5
    `;

    const countQuery = `
      WITH CombinedData AS (
        SELECT 
          t.id as id,
          t.kode as invoice,
          m.fullname as member,
          m.kode as member_kode,
          'Prabayar' as type,
          t."nomorTujuan" as tujuan,
          t.status as status
        FROM "Transaction" t
        LEFT JOIN "RiwayatTransaksi" rt ON t."riwayatTransaksiId" = rt.id
        LEFT JOIN "Member" m ON rt."memberId" = m.id
        WHERE t."createdAt" >= $1 AND t."createdAt" <= $2
        
        UNION ALL
        
        SELECT 
          tp.id as id,
          tp."trId" as invoice,
          m.fullname as member,
          m.kode as member_kode,
          'Pascabayar' as type,
          tp."nomorTujuan" as tujuan,
          tp.status as status
        FROM "TransactionPascabayar" tp
        LEFT JOIN "RiwayatTransaksi" rt ON tp."riwayatTransaksiId" = rt.id
        LEFT JOIN "Member" m ON rt."memberId" = m.id
        WHERE tp."createdAt" >= $1 AND tp."createdAt" <= $2
        
        UNION ALL
        
        SELECT 
          d.id as id,
          d.kode as invoice,
          m.fullname as member,
          m.kode as member_kode,
          'Deposit' as type,
          '-' as tujuan,
          d.status as status
        FROM "RequestDeposit" d
        LEFT JOIN "RiwayatTransaksi" rt ON d."riwayatTransaksiId" = rt.id
        LEFT JOIN "Member" m ON rt."memberId" = m.id
        WHERE d."createdAt" >= $1 AND d."createdAt" <= $2
      )
      SELECT COUNT(*) as total FROM CombinedData
      WHERE (invoice ILIKE $3 OR member ILIKE $3 OR tujuan ILIKE $3 OR member_kode ILIKE $3)
      ${typeFilter !== 'all' ? `AND type = '${typeFilter === 'prabayar' ? 'Prabayar' : typeFilter === 'pascabayar' ? 'Pascabayar' : 'Deposit'}'` : ''}
    `;

    const [list, countRes] = await Promise.all([
      this.prisma.$queryRawUnsafe<any[]>(rawQuery, start, end, searchParam, limit, skip),
      this.prisma.$queryRawUnsafe<any[]>(countQuery, start, end, searchParam)
    ]);

    const total = Number(countRes[0]?.total || 0);

    return {
      list: list.map(item => ({
        ...item,
        harga: Number(item.harga),
        keuntungan: Number(item.keuntungan)
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  // --- Helpers ---

  private formatTxGroup(stats: any[], nominalKey: string) {
    let totalCount = 0;
    let totalNominal = 0;
    let totalLaba = 0;
    let totalSuccess = 0;
    let totalPending = 0;
    let totalFailed = 0;

    for (const stat of stats) {
      const count = stat._count?.id || 0;
      const nominal = stat._sum?.[nominalKey] || 0;
      const laba = stat._sum?.laba || 0;

      totalCount += count;

      if (stat.status === 'sukses') {
        totalSuccess += count;
        totalNominal += nominal; // Hanya hitung nominal jika sukses
        totalLaba += laba;       // Hanya hitung laba jika sukses
      } else if (stat.status === 'proses') {
        totalPending += count;
      } else if (stat.status === 'gagal') {
        totalFailed += count;
      }
    }

    return { totalCount, totalNominal, totalLaba, totalSuccess, totalPending, totalFailed };
  }

  private formatDepositGroup(stats: any[]) {
    let totalCount = 0;
    let totalNominal = 0;
    let totalLaba = 0;
    let totalSuccess = 0;
    let totalPending = 0;
    let totalFailed = 0;

    for (const stat of stats) {
      const count = stat._count?.id || 0;
      const nominal = stat._sum?.nominal || 0;

      totalCount += count;

      if (stat.status === 'sukses') {
        totalSuccess += count;
        totalNominal += nominal;
      } else if (stat.status === 'proses') {
        totalPending += count;
      } else if (stat.status === 'gagal') {
        totalFailed += count;
      }
    }

    return { totalCount, totalNominal, totalLaba, totalSuccess, totalPending, totalFailed };
  }

  private mergeDailyData(prabayarRaw: any[], pascabayarRaw: any[]) {
    const map = new Map<string, any>();

    const process = (data: any[]) => {
      for (const item of data) {
        // Handle field naming differences if needed. Using date or month.
        const keyDate = item.date || item.month;
        if (!keyDate) continue;
        const keyStr = moment(keyDate).format('YYYY-MM-DD');
        if (!map.has(keyStr)) {
          map.set(keyStr, { date: keyStr, count: 0, nominal: 0, laba: 0 });
        }
        const existing = map.get(keyStr);
        existing.count += Number(item.count || 0);
        existing.nominal += Number(item.nominal || 0);
        existing.laba += Number(item.laba || 0);
      }
    };

    process(prabayarRaw);
    process(pascabayarRaw);

    const merged = Array.from(map.values());
    merged.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return merged;
  }
}
