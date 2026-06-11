import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { GetSellerDigiflazzDto } from './dto/get-seller-digiflazz.dto';

@Injectable()
export class DaftarSellerDigiflazzService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: GetSellerDigiflazzDto) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const search = query.search || '';

    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [list, total] = await Promise.all([
      this.prisma.digiflazzSeller.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { digiflazzSellerProducts: true }
          }
        }
      }),
      this.prisma.digiflazzSeller.count({ where }),
    ]);

    return {
      list,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateStatus(id: number, status: 'banned' | 'unbanned') {
    const seller = await this.prisma.digiflazzSeller.findUnique({ where: { id } });
    if (!seller) {
      throw new Error('Seller tidak ditemukan');
    }
    
    return await this.prisma.digiflazzSeller.update({
      where: { id },
      data: { status },
    });
  }
}
