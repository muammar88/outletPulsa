import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class TransaksiLinkquService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: any) {
    const { page = 1, limit = 10, search = '' } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {};

    if (search) {
      where.OR = [
        { bank_name: { contains: search, mode: 'insensitive' } },
        { payment_method: { contains: search, mode: 'insensitive' } },
        { status: { contains: search, mode: 'insensitive' } },
        { partner_reff: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.paymentGatewayTransaction.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: 'desc' },
        include: {
          requestDeposit: {
            include: {
              riwayatTransaksi: {
                include: {
                  member: {
                    select: {
                      fullname: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.paymentGatewayTransaction.count({ where }),
    ]);

    const dataWithNames = data.map((t) => {
      let customerName = '-';
      if (t.requestDeposit?.riwayatTransaksi?.member?.fullname) {
        customerName = t.requestDeposit.riwayatTransaksi.member.fullname;
      }
      return {
        ...t,
        customer_name: customerName,
      };
    });

    return {
      message: 'Berhasil mengambil data transaksi LinkQu',
      data: {
        data: dataWithNames,
        meta: {
          total,
          page: Number(page),
          last_page: Math.ceil(total / take) || 1,
          per_page: take,
        },
      },
    };
  }

  /**
   * Mengambil laporan audit read-only untuk transaksi LinkQu dengan status SUCCESS
   * yang memiliki indikasi anomali kredit atau ketiadaan bukti mutasi ledger.
   *
   * Kategori Faktual (Non-Asumtif):
   * 1. BUKTI_KREDIT_TIDAK_DITEMUKAN: Gateway SUCCESS, tapi mutasi ledger kredit tidak ada
   * 2. BUKTI_KREDIT_AMBIGU: Ditemukan >1 entri ledger pada transaksi yang sama
   * 3. MISSING_DEPOSIT_RELATION: Relasi requestDeposit bernilai null
   * 4. DEPOSIT_STATUS_MISMATCH: Gateway SUCCESS tetapi requestDeposit bukan 'sukses'
   * 5. MISSING_MEMBER_RELATION: Relasi member bernilai null
   */
  async getUncreditedCandidates(query: any) {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(query.limit || '10', 10)));
    const search = (query.search || '').trim();
    const filterCategory = query.category;

    const where: any = {
      provider: 'LINKQU',
      status: 'SUCCESS',
    };

    if (search) {
      where.OR = [
        { partner_reff: { contains: search, mode: 'insensitive' } },
        { payment_method: { contains: search, mode: 'insensitive' } },
        { bank_name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const allCandidates = await this.prisma.paymentGatewayTransaction.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        settlementLedger: true,
        requestDeposit: {
          include: {
            riwayatTransaksi: {
              include: {
                member: {
                  select: { id: true, fullname: true, whatsappnumber: true, saldo: true },
                },
                riwayatSaldos: true,
              },
            },
          },
        },
      },
    });

    const evaluatedList: any[] = [];

    for (const tx of allCandidates) {
      const deposit = tx.requestDeposit;
      const member = deposit?.riwayatTransaksi?.member;
      const riwayatSaldos = deposit?.riwayatTransaksi?.riwayatSaldos || [];

      const hasSettlementLedger = !!tx.settlement_ledger_id || !!tx.settlementLedger;

      let category: string | null = null;
      let reason = '';

      if (!deposit) {
        category = 'MISSING_DEPOSIT_RELATION';
        reason = 'Transaksi bertipe DEPOSIT tetapi data requestDeposit tidak ditemukan di database';
      } else if (!member) {
        category = 'MISSING_MEMBER_RELATION';
        reason = 'Relasi member dari requestDeposit / riwayatTransaksi tidak ditemukan';
      } else if (deposit.status !== 'sukses') {
        category = 'DEPOSIT_STATUS_MISMATCH';
        reason = `Status transaksi gateway adalah SUCCESS, namun status requestDeposit masih '${deposit.status}'`;
      } else if (!hasSettlementLedger) {
        const matchingSaldos = riwayatSaldos.filter(
          (s) => s.status === 'deposit' && (s.nominal === Number(tx.amount) || s.nominal === deposit.nominal),
        );

        if (matchingSaldos.length === 0) {
          category = 'BUKTI_KREDIT_TIDAK_DITEMUKAN';
          reason =
            'Gateway SUCCESS dan requestDeposit sukses, namun tidak ditemukan riwayat saldo mutasi kredit maupun settlement ledger tertaut';
        } else if (matchingSaldos.length > 1) {
          category = 'BUKTI_KREDIT_AMBIGU';
          reason = `Ditemukan ${matchingSaldos.length} entri mutasi saldo pada riwayat transaksi yang sama tanpa tautan settlement unik`;
        }
      }

      if (category) {
        if (!filterCategory || filterCategory === category) {
          evaluatedList.push({
            gateway_id: tx.id,
            partner_reff: tx.partner_reff,
            provider: tx.provider,
            amount: tx.amount,
            status: tx.status,
            payment_method: tx.payment_method,
            category,
            reason,
            settlement_ref: tx.settlement_ref || null,
            settlement_ledger_id: tx.settlement_ledger_id || null,
            deposit_id: deposit?.id || null,
            deposit_status: deposit?.status || null,
            member_id: member?.id || null,
            member_name: member?.fullname || null,
            created_at: tx.created_at,
          });
        }
      }
    }

    const total = evaluatedList.length;
    const startIndex = (page - 1) * limit;
    const paginatedItems = evaluatedList.slice(startIndex, startIndex + limit);

    return {
      message: 'Berhasil mengambil data kandidat transaksi LinkQu uncredited / anomali',
      data: {
        items: paginatedItems,
        meta: {
          total,
          page,
          per_page: limit,
          total_pages: Math.ceil(total / limit) || 1,
        },
      },
    };
  }
}
