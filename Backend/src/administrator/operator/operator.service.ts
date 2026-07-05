import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { UpdateOperatorDto } from './dto/update-operator.dto';
import { GetOperatorDto } from './dto/get-operator.dto';

@Injectable()
export class OperatorService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: GetOperatorDto) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const search = query.search || '';
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { kode: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (query.kategoriId) {
      where.kategoriId = parseInt(query.kategoriId, 10);
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.tipe) {
      where.kategori = { type: query.tipe as any };
    }

    const [list, total] = await Promise.all([
      this.prisma.operator.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        include: {
          kategori: true,
          _count: {
            select: { produks: true }
          },
          prefixes: true,
        },
      }),
      this.prisma.operator.count({ where }),
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
    const operator = await this.prisma.operator.findUnique({
      where: { id },
      include: {
        kategori: true,
        _count: {
          select: { produks: true }
        },
        prefixes: true,
      },
    });

    if (!operator) {
      throw new NotFoundException(`Operator dengan ID ${id} tidak ditemukan`);
    }

    return operator;
  }

  async create(createOperatorDto: CreateOperatorDto) {
    const existing = await this.prisma.operator.findFirst({
      where: { kode: createOperatorDto.kode },
    });

    if (existing) {
      throw new BadRequestException(`Operator dengan kode ${createOperatorDto.kode} sudah terdaftar`);
    }

    if (createOperatorDto.kategoriId) {
       const kategori = await this.prisma.kategori.findUnique({ where: { id: createOperatorDto.kategoriId }});
       if (!kategori) throw new BadRequestException('Kategori tidak ditemukan');
    }

    return this.prisma.operator.create({
      data: createOperatorDto,
      include: {
        kategori: true,
      }
    });
  }

  async update(id: number, updateOperatorDto: UpdateOperatorDto) {
    await this.findOne(id); // Ensure exists

    if (updateOperatorDto.kode) {
      const existing = await this.prisma.operator.findFirst({
        where: { kode: updateOperatorDto.kode, id: { not: id } },
      });
      if (existing) {
        throw new BadRequestException(`Operator dengan kode ${updateOperatorDto.kode} sudah terdaftar`);
      }
    }

    if (updateOperatorDto.kategoriId) {
       const kategori = await this.prisma.kategori.findUnique({ where: { id: updateOperatorDto.kategoriId }});
       if (!kategori) throw new BadRequestException('Kategori tidak ditemukan');
    }

    const { prefixes, ...operatorData } = updateOperatorDto;

    return this.prisma.operator.update({
      where: { id },
      data: {
        ...operatorData,
        ...(prefixes !== undefined ? {
          prefixes: {
            deleteMany: {},
            create: prefixes.map(p => ({ prefix: p }))
          }
        } : {})
      },
      include: {
        kategori: true,
      }
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    try {
      return await this.prisma.operator.delete({
        where: { id },
      });
    } catch (error: any) {
      if (error.code === 'P2003') {
        throw new BadRequestException('Tidak dapat menghapus operator karena sedang digunakan oleh entitas lain (contoh: produk atau prefix).');
      }
      throw new BadRequestException('Gagal menghapus operator');
    }
  }
}
