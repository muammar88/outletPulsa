import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { GetOperatorIakDto } from './dto/get-operator-iak.dto';

@Injectable()
export class DaftarOperatorIakService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: GetOperatorIakDto) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const search = query.search || '';
    const typeId = query.typeId ? parseInt(query.typeId, 10) : undefined;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (typeId) {
      where.typeId = typeId;
    }

    const [list, total] = await Promise.all([
      this.prisma.iakPrabayarOperator.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          type: true,
          _count: {
            select: { iakPrabayarProduks: true }
          }
        }
      }),
      this.prisma.iakPrabayarOperator.count({ where }),
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
