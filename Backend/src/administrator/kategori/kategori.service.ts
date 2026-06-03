import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateKategoriDto } from './dto/create-kategori.dto';
import { UpdateKategoriDto } from './dto/update-kategori.dto';
import { GetKategoriDto } from './dto/get-kategori.dto';

@Injectable()
export class KategoriService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: GetKategoriDto) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const search = query.search || '';
    const type = query.type;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { kode: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (type) {
      where.type = type;
    }

    const [list, total] = await Promise.all([
      this.prisma.kategori.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        include: {
          _count: {
            select: { operators: true }
          }
        }
      }),
      this.prisma.kategori.count({ where }),
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
    const kategori = await this.prisma.kategori.findUnique({
      where: { id },
      include: {
        _count: {
          select: { operators: true }
        }
      }
    });

    if (!kategori) {
      throw new NotFoundException(`Kategori dengan ID ${id} tidak ditemukan`);
    }

    return kategori;
  }

  async create(createKategoriDto: CreateKategoriDto) {
    const existing = await this.prisma.kategori.findFirst({
      where: { kode: createKategoriDto.kode },
    });

    if (existing) {
      throw new BadRequestException(`Kategori dengan kode ${createKategoriDto.kode} sudah terdaftar`);
    }

    return this.prisma.kategori.create({
      data: createKategoriDto,
    });
  }

  async update(id: number, updateKategoriDto: UpdateKategoriDto) {
    await this.findOne(id); // Ensure exists

    if (updateKategoriDto.kode) {
      const existing = await this.prisma.kategori.findFirst({
        where: { kode: updateKategoriDto.kode, id: { not: id } },
      });
      if (existing) {
        throw new BadRequestException(`Kategori dengan kode ${updateKategoriDto.kode} sudah terdaftar`);
      }
    }

    return this.prisma.kategori.update({
      where: { id },
      data: updateKategoriDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    try {
      return await this.prisma.kategori.delete({
        where: { id },
      });
    } catch (error: any) {
      if (error.code === 'P2003') {
        throw new BadRequestException('Tidak dapat menghapus kategori karena sedang digunakan oleh operator atau produk.');
      }
      throw new BadRequestException('Gagal menghapus kategori');
    }
  }
}
