import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateSemuaProdukDto } from './dto/create-semua-produk.dto';
import { UpdateSemuaProdukDto } from './dto/update-semua-produk.dto';
import { GetSemuaProdukDto } from './dto/get-semua-produk.dto';
import { ProdukType, ProdukStatus } from '@prisma/client';

@Injectable()
export class SemuaProdukService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: GetSemuaProdukDto) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const search = query.search || '';
    const status = query.status as ProdukStatus | undefined;
    const type = query.type as ProdukType | undefined;
    const operatorId = query.operatorId ? parseInt(query.operatorId, 10) : undefined;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { kode: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (operatorId) {
      where.operatorId = operatorId;
    }

    const [list, total] = await Promise.all([
      this.prisma.produk.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          operator: true,
          server: true,
        },
      }),
      this.prisma.produk.count({ where }),
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
    const produk = await this.prisma.produk.findUnique({
      where: { id },
      include: {
        operator: true,
        server: true,
      },
    });

    if (!produk) {
      throw new NotFoundException(`Produk with ID ${id} not found`);
    }
    return produk;
  }

  async create(createSemuaProdukDto: CreateSemuaProdukDto) {
    // Check for existing produk with same kode
    const existing = await this.prisma.produk.findFirst({
      where: { kode: createSemuaProdukDto.kode },
    });

    if (existing) {
      throw new BadRequestException(`Produk dengan kode ${createSemuaProdukDto.kode} sudah terdaftar`);
    }

    const newProduk = await this.prisma.produk.create({
      data: {
        operatorId: createSemuaProdukDto.operatorId,
        kode: createSemuaProdukDto.kode,
        name: createSemuaProdukDto.name,
        type: createSemuaProdukDto.type,
        purchase_price: createSemuaProdukDto.purchase_price || 0,
        markup: createSemuaProdukDto.markup || 0,
        serverId: createSemuaProdukDto.serverId,
        status: createSemuaProdukDto.status || 'active',
      },
      include: {
        operator: true,
      }
    });

    return newProduk;
  }

  async update(id: number, updateSemuaProdukDto: UpdateSemuaProdukDto) {
    await this.findOne(id); // Ensure produk exists

    if (updateSemuaProdukDto.kode) {
      const existing = await this.prisma.produk.findFirst({
        where: { kode: updateSemuaProdukDto.kode, id: { not: id } },
      });
      if (existing) {
        throw new BadRequestException(`Produk dengan kode ${updateSemuaProdukDto.kode} sudah terdaftar`);
      }
    }

    return this.prisma.produk.update({
      where: { id },
      data: updateSemuaProdukDto,
      include: {
        operator: true,
      }
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.produk.delete({
      where: { id },
    });
  }
}
