import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { GetRiwayatDto } from './dto/get-riwayat.dto';

@Injectable()
export class RiwayatTransferSaldoService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: GetRiwayatDto) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.search) {
      where.OR = [
        { trxId: { contains: query.search, mode: 'insensitive' } },
        { keterangan: { contains: query.search, mode: 'insensitive' } },
        {
          serverAsal: {
            name: { contains: query.search, mode: 'insensitive' }
          }
        },
        {
          serverTujuan: {
            name: { contains: query.search, mode: 'insensitive' }
          }
        }
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.startDate && query.endDate) {
      const start = new Date(query.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      
      where.createdAt = {
        gte: start,
        lte: end,
      };
    }

    const orderBy: any = {};
    if (query.sortField) {
      if (query.sortField === 'serverAsal.name') {
        orderBy.serverAsal = { name: query.sortOrder || 'desc' };
      } else if (query.sortField === 'serverTujuan.name') {
        orderBy.serverTujuan = { name: query.sortOrder || 'desc' };
      } else {
        orderBy[query.sortField] = query.sortOrder || 'desc';
      }
    } else {
      orderBy.createdAt = 'desc';
    }

    const [data, total] = await Promise.all([
      this.prisma.riwayatTransferSaldoServer.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          serverAsal: true,
          serverTujuan: true,
          user: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      }),
      this.prisma.riwayatTransferSaldoServer.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(id: number) {
    return this.prisma.riwayatTransferSaldoServer.findUnique({
      where: { id },
      include: {
        serverAsal: true,
        serverTujuan: true,
        user: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });
  }
}
