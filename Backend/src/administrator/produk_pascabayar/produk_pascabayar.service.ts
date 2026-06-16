import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateProdukPascabayarDto } from './dto/create-produk-pascabayar.dto';
import { UpdateProdukPascabayarDto } from './dto/update-produk-pascabayar.dto';
import { GetProdukPascabayarDto } from './dto/get-produk-pascabayar.dto';
import { ProdukStatus } from '@prisma/client';

@Injectable()
export class ProdukPascabayarService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: GetProdukPascabayarDto) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const search = query.search || '';
    const status = query.status as ProdukStatus | undefined;
    const kategoriId = query.kategoriId ? parseInt(query.kategoriId, 10) : undefined;

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

    if (kategoriId) {
      where.kategoriId = kategoriId;
    }

    const [list, total] = await Promise.all([
      this.prisma.produkPascabayar.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          kategori: true,
          server: true,
          iakPascabayarProducts: true,
        },
      }),
      this.prisma.produkPascabayar.count({ where }),
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
    const produk = await this.prisma.produkPascabayar.findUnique({
      where: { id },
      include: {
        kategori: true,
        server: true,
      },
    });

    if (!produk) {
      throw new NotFoundException(`Produk Pascabayar with ID ${id} not found`);
    }
    return produk;
  }

  async create(createProdukPascabayarDto: CreateProdukPascabayarDto) {
    const existing = await this.prisma.produkPascabayar.findFirst({
      where: { kode: createProdukPascabayarDto.kode },
    });

    if (existing) {
      throw new BadRequestException(`Produk Pascabayar dengan kode ${createProdukPascabayarDto.kode} sudah terdaftar`);
    }

    const newProduk = await this.prisma.produkPascabayar.create({
      data: {
        kategoriId: createProdukPascabayarDto.kategoriId,
        kode: createProdukPascabayarDto.kode,
        name: createProdukPascabayarDto.name,
        fee: createProdukPascabayarDto.fee || 0,
        comission: createProdukPascabayarDto.comission || 0,
        outletFee: createProdukPascabayarDto.outletFee || 0,
        serverId: createProdukPascabayarDto.serverId,
        status: createProdukPascabayarDto.status || 'active',
      },
      include: {
        kategori: true,
      }
    });

    return newProduk;
  }

  async update(id: number, updateProdukPascabayarDto: UpdateProdukPascabayarDto) {
    const produk = await this.prisma.produkPascabayar.findUnique({
      where: { id },
      include: {
        iakPascabayarProducts: true,
      },
    });

    if (!produk) {
      throw new NotFoundException(`Produk Pascabayar with ID ${id} not found`);
    }

    if (updateProdukPascabayarDto.kode) {
      const existing = await this.prisma.produkPascabayar.findFirst({
        where: { kode: updateProdukPascabayarDto.kode, id: { not: id } },
      });
      if (existing) {
        throw new BadRequestException(`Produk Pascabayar dengan kode ${updateProdukPascabayarDto.kode} sudah terdaftar`);
      }
    }

    return this.prisma.produkPascabayar.update({
      where: { id },
      data: {
        kategoriId: updateProdukPascabayarDto.kategoriId,
        kode: updateProdukPascabayarDto.kode,
        name: updateProdukPascabayarDto.name,
        fee: updateProdukPascabayarDto.fee,
        comission: updateProdukPascabayarDto.comission,
        outletFee: updateProdukPascabayarDto.outletFee,
        serverId: updateProdukPascabayarDto.serverId,
        status: updateProdukPascabayarDto.status,
      },
      include: {
        kategori: true,
      }
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.produkPascabayar.delete({
      where: { id },
    });
  }

  async bulkUpdateStatus(ids: number[], status: 'active' | 'inactive') {
    const result = await this.prisma.produkPascabayar.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });

    return {
      success: result.count,
      failed: ids.length - result.count,
    };
  }

  async bulkDelete(ids: number[]) {
    const result = await this.prisma.produkPascabayar.deleteMany({
      where: { id: { in: ids } },
    });

    return {
      success: result.count,
      failed: ids.length - result.count,
    };
  }
}