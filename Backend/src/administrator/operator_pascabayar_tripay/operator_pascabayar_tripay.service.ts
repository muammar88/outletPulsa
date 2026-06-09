import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { GetOperatorPascabayarTripayDto } from './dto/get-operator-pascabayar-tripay.dto';
import { CreateOperatorPascabayarTripayDto } from './dto/create-operator-pascabayar-tripay.dto';
import { UpdateOperatorPascabayarTripayDto } from './dto/update-operator-pascabayar-tripay.dto';

@Injectable()
export class OperatorPascabayarTripayService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: GetOperatorPascabayarTripayDto) {
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
      this.prisma.tripayPascabayarOperator.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          kategori: true,
          _count: {
            select: { tripayPascabayarProduks: true },
          },
        },
      }),
      this.prisma.tripayPascabayarOperator.count({ where }),
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
    const operator = await this.prisma.tripayPascabayarOperator.findUnique({
      where: { id },
      include: {
        kategori: true,
        tripayPascabayarProduks: {
          orderBy: { name: 'asc' },
        },
        _count: {
          select: { tripayPascabayarProduks: true },
        },
      },
    });

    if (!operator) {
      throw new NotFoundException(`Operator Pascabayar Tripay dengan ID ${id} tidak ditemukan`);
    }

    return operator;
  }

  async create(dto: CreateOperatorPascabayarTripayDto, userId: number) {
    const newOperator = await this.prisma.tripayPascabayarOperator.create({
      data: {
        name: dto.name,
        kode: dto.kode,
        kategoriId: dto.kategoriId,
      },
    });

    await this.prisma.activityLog.create({
      data: {
        userId,
        action: 'CREATE_OPERATOR_PASCABAYAR_TRIPAY',
        entity: 'TripayPrabayarOperator',
        entityId: String(newOperator.id),
        description: `Menambahkan operator prabayar tripay baru: ${newOperator.name} (${newOperator.kode})`,
      },
    });

    return newOperator;
  }

  async update(id: number, dto: UpdateOperatorPascabayarTripayDto, userId: number) {
    await this.findOne(id);

    const updated = await this.prisma.tripayPascabayarOperator.update({
      where: { id },
      data: dto,
    });

    await this.prisma.activityLog.create({
      data: {
        userId,
        action: 'UPDATE_OPERATOR_PASCABAYAR_TRIPAY',
        entity: 'TripayPrabayarOperator',
        entityId: String(id),
        description: `Memperbarui operator prabayar tripay: ${updated.name} (${updated.kode})`,
      },
    });

    return updated;
  }

  async remove(id: number, userId: number) {
    const operator = await this.findOne(id);

    await this.prisma.tripayPascabayarOperator.delete({ where: { id } });

    await this.prisma.activityLog.create({
      data: {
        userId,
        action: 'DELETE_OPERATOR_PASCABAYAR_TRIPAY',
        entity: 'TripayPrabayarOperator',
        entityId: String(id),
        description: `Menghapus operator prabayar tripay: ${operator.name} (${operator.kode})`,
      },
    });

    return { message: `Operator ${operator.name} berhasil dihapus` };
  }
}
