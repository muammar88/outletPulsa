import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { GetKategoriTripayDto } from './dto/get-kategori-tripay.dto';
import { CreateKategoriTripayDto } from './dto/create-kategori-tripay.dto';
import { UpdateKategoriTripayDto } from './dto/update-kategori-tripay.dto';

@Injectable()
export class KategoriTripayService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: GetKategoriTripayDto) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const search = query.search || '';
    const skip = (page - 1) * limit;

    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = (query.sortOrder || 'desc') as 'asc' | 'desc';

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as any } },
            { type: { contains: search, mode: 'insensitive' as any } },
          ],
        }
      : {};

    const orderBy: any = { [sortBy]: sortOrder };

    const [list, total] = await Promise.all([
      this.prisma.tripayPrabayarKategori.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          _count: {
            select: {
              tripayPrabayarOperators: true,
            },
          },
        },
      }),
      this.prisma.tripayPrabayarKategori.count({ where }),
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
    const kategori = await this.prisma.tripayPrabayarKategori.findUnique({
      where: { id },
      include: {
        tripayPrabayarOperators: {
          include: {
            _count: {
              select: { tripayPrabayarProduks: true },
            },
          },
          orderBy: { name: 'asc' },
        },
        _count: {
          select: { tripayPrabayarOperators: true },
        },
      },
    });

    if (!kategori) {
      throw new NotFoundException(`Kategori Tripay dengan ID ${id} tidak ditemukan`);
    }

    return kategori;
  }

  async create(dto: CreateKategoriTripayDto, userId: number) {
    const newKategori = await this.prisma.tripayPrabayarKategori.create({
      data: {
        name: dto.name,
        type: dto.type,
      },
    });

    await this.prisma.activityLog.create({
      data: {
        userId,
        action: 'CREATE_KATEGORI_TRIPAY',
        entity: 'TripayPrabayarKategori',
        entityId: String(newKategori.id),
        description: `Menambahkan kategori tripay baru: ${newKategori.name}`,
      },
    });

    return newKategori;
  }

  async update(id: number, dto: UpdateKategoriTripayDto, userId: number) {
    await this.findOne(id);

    const updated = await this.prisma.tripayPrabayarKategori.update({
      where: { id },
      data: dto,
    });

    await this.prisma.activityLog.create({
      data: {
        userId,
        action: 'UPDATE_KATEGORI_TRIPAY',
        entity: 'TripayPrabayarKategori',
        entityId: String(id),
        description: `Memperbarui kategori tripay: ${updated.name}`,
      },
    });

    return updated;
  }

  async remove(id: number, userId: number) {
    const kategori = await this.findOne(id);

    await this.prisma.tripayPrabayarKategori.delete({ where: { id } });

    await this.prisma.activityLog.create({
      data: {
        userId,
        action: 'DELETE_KATEGORI_TRIPAY',
        entity: 'TripayPrabayarKategori',
        entityId: String(id),
        description: `Menghapus kategori tripay: ${kategori.name}`,
      },
    });

    return { message: `Kategori ${kategori.name} berhasil dihapus` };
  }
}
