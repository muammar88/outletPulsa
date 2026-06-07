import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { GetTypeIakDto } from './dto/get-type-iak.dto';

@Injectable()
export class DaftarTypeIakService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: GetTypeIakDto) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const search = query.search || '';

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.type = { contains: search, mode: 'insensitive' };
    }

    const [list, total] = await Promise.all([
      this.prisma.iakPrabayarType.findMany({
        where,
        skip,
        take: limit,
        orderBy: { type: 'asc' },
        include: {
          _count: {
            select: { iakPrabayarOperators: true }
          }
        }
      }),
      this.prisma.iakPrabayarType.count({ where }),
    ]);

    return {
      list,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
