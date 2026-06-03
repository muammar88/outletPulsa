import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { GetLogDto } from './dto/get-log.dto';

@Injectable()
export class LogService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: GetLogDto) {
    const { page = '1', limit = '10', search, action } = query;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const where: any = {};

    if (action) {
      where.action = action;
    }

    if (search) {
      where.OR = [
        { action: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { entity: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { member: { fullname: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [list, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: { id: true, name: true }
          },
          member: {
            select: { id: true, fullname: true, kode: true }
          }
        }
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNumber);

    return {
      statusCode: 200,
      message: 'Berhasil mengambil data log',
      data: {
        list,
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages,
      },
    };
  }
}
