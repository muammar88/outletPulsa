import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { GetOperatorTripayDto } from './dto/get-operator-tripay.dto';
import { CreateOperatorTripayDto } from './dto/create-operator-tripay.dto';
import { UpdateOperatorTripayDto } from './dto/update-operator-tripay.dto';

@Injectable()
export class OperatorTripayService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: GetOperatorTripayDto) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const search = query.search || '';
    const skip = (page - 1) * limit;

    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = (query.sortOrder || 'desc') as 'asc' | 'desc';
    const kategoriId = query.kategoriId ? parseInt(query.kategoriId, 10) : undefined;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { kode: { contains: search, mode: 'insensitive' } },
        { kategori: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (kategoriId) {
      where.kategoriId = kategoriId;
    }

    let orderBy: any;
    if (sortBy === 'kategori') {
      orderBy = { kategori: { name: sortOrder } };
    } else {
      orderBy = { [sortBy]: sortOrder };
    }

    const [list, total] = await Promise.all([
      this.prisma.tripayPrabayarOperator.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          kategori: true,
          _count: {
            select: { tripayPrabayarProduks: true },
          },
        },
      }),
      this.prisma.tripayPrabayarOperator.count({ where }),
    ]);

    return {
      list,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const operator = await this.prisma.tripayPrabayarOperator.findUnique({
      where: { id },
      include: {
        kategori: true,
        tripayPrabayarProduks: {
          orderBy: { name: 'asc' },
        },
        _count: {
          select: { tripayPrabayarProduks: true },
        },
      },
    });

    if (!operator) {
      throw new NotFoundException(`Operator Tripay dengan ID ${id} tidak ditemukan`);
    }

    return operator;
  }

  async create(dto: CreateOperatorTripayDto, userId: number) {
    const newOperator = await this.prisma.tripayPrabayarOperator.create({
      data: {
        name: dto.name,
        kode: dto.kode,
        kategoriId: dto.kategoriId,
      },
    });

    await this.prisma.activityLog.create({
      data: {
        userId,
        action: 'CREATE_OPERATOR_TRIPAY',
        entity: 'TripayPrabayarOperator',
        entityId: String(newOperator.id),
        description: `Menambahkan operator tripay baru: ${newOperator.name} (${newOperator.kode})`,
      },
    });

    return newOperator;
  }

  async update(id: number, dto: UpdateOperatorTripayDto, userId: number) {
    await this.findOne(id);

    const updated = await this.prisma.tripayPrabayarOperator.update({
      where: { id },
      data: dto,
    });

    await this.prisma.activityLog.create({
      data: {
        userId,
        action: 'UPDATE_OPERATOR_TRIPAY',
        entity: 'TripayPrabayarOperator',
        entityId: String(id),
        description: `Memperbarui operator tripay: ${updated.name} (${updated.kode})`,
      },
    });

    return updated;
  }

  async remove(id: number, userId: number) {
    const operator = await this.findOne(id);

    await this.prisma.tripayPrabayarOperator.delete({ where: { id } });

    await this.prisma.activityLog.create({
      data: {
        userId,
        action: 'DELETE_OPERATOR_TRIPAY',
        entity: 'TripayPrabayarOperator',
        entityId: String(id),
        description: `Menghapus operator tripay: ${operator.name} (${operator.kode})`,
      },
    });

    return { message: `Operator ${operator.name} berhasil dihapus` };
  }
}
