import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { GetKategoriPascabayarTripayDto } from './dto/get-kategori-pascabayar-tripay.dto';
import { CreateKategoriPascabayarTripayDto } from './dto/create-kategori-pascabayar-tripay.dto';
import { UpdateKategoriPascabayarTripayDto } from './dto/update-kategori-pascabayar-tripay.dto';

@Injectable()
export class KategoriPascabayarTripayService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: GetKategoriPascabayarTripayDto) {
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
          ],
        }
      : {};

    const orderBy: any = { [sortBy]: sortOrder };

    const [list, total] = await Promise.all([
      this.prisma.tripayPascabayarKategori.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          _count: {
            select: {
              tripayPascabayarOperators: true,
            },
          },
        },
      }),
      this.prisma.tripayPascabayarKategori.count({ where }),
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
    const kategori = await this.prisma.tripayPascabayarKategori.findUnique({
      where: { id },
      include: {
        tripayPascabayarOperators: {
          include: {
            _count: {
              select: { tripayPascabayarProduks: true },
            },
          },
          orderBy: { name: 'asc' },
        },
        _count: {
          select: { tripayPascabayarOperators: true },
        },
      },
    });

    if (!kategori) {
      throw new NotFoundException(`Kategori Pascabayar Tripay dengan ID ${id} tidak ditemukan`);
    }

    return kategori;
  }

  async create(dto: CreateKategoriPascabayarTripayDto, userId: number) {
    const newKategori = await this.prisma.tripayPascabayarKategori.create({
      data: {
        name: dto.name,
      },
    });

    await this.prisma.activityLog.create({
      data: {
        userId,
        action: 'CREATE_KATEGORI_PASCABAYAR_TRIPAY',
        entity: 'TripayPrabayarKategori',
        entityId: String(newKategori.id),
        description: `Menambahkan kategori prabayar tripay baru: ${newKategori.name}`,
      },
    });

    return newKategori;
  }

  async update(id: number, dto: UpdateKategoriPascabayarTripayDto, userId: number) {
    await this.findOne(id);

    const updated = await this.prisma.tripayPascabayarKategori.update({
      where: { id },
      data: dto,
    });

    await this.prisma.activityLog.create({
      data: {
        userId,
        action: 'UPDATE_KATEGORI_PASCABAYAR_TRIPAY',
        entity: 'TripayPrabayarKategori',
        entityId: String(id),
        description: `Memperbarui kategori prabayar tripay: ${updated.name}`,
      },
    });

    return updated;
  }

  async remove(id: number, userId: number) {
    const kategori = await this.findOne(id);

    await this.prisma.tripayPascabayarKategori.delete({ where: { id } });

    await this.prisma.activityLog.create({
      data: {
        userId,
        action: 'DELETE_KATEGORI_PASCABAYAR_TRIPAY',
        entity: 'TripayPrabayarKategori',
        entityId: String(id),
        description: `Menghapus kategori prabayar tripay: ${kategori.name}`,
      },
    });

    return { message: `Kategori ${kategori.name} berhasil dihapus` };
  }
}
