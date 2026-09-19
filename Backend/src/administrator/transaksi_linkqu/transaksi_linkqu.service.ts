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
                    }
                  }
                }
              }
            }
          }
        }
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
}
