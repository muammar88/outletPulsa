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
          iakPrabayarProduks: true,
          tripayPrabayarProduks: true,
          digiflazzProducts: true,
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
    const produk = await this.prisma.produk.findUnique({
      where: { id },
      include: {
        iakPrabayarProduks: true,
        tripayPrabayarProduks: true,
        digiflazzProducts: true,
      },
    });

    if (!produk) {
      throw new NotFoundException(`Produk with ID ${id} not found`);
    }

    if (updateSemuaProdukDto.kode) {
      const existing = await this.prisma.produk.findFirst({
        where: { kode: updateSemuaProdukDto.kode, id: { not: id } },
      });
      if (existing) {
        throw new BadRequestException(`Produk dengan kode ${updateSemuaProdukDto.kode} sudah terdaftar`);
      }
    }

    if (updateSemuaProdukDto.serverId !== undefined && updateSemuaProdukDto.serverId !== null) {
      const serverId = updateSemuaProdukDto.serverId;
      if (serverId === 1 && produk.iakPrabayarProduks.length === 0) {
        throw new BadRequestException('Server IAK tidak memiliki produk yang terhubung dengan produk ini');
      }
      if (serverId === 2 && produk.tripayPrabayarProduks.length === 0) {
        throw new BadRequestException('Server Tripay tidak memiliki produk yang terhubung dengan produk ini');
      }
      if (serverId === 3 && produk.digiflazzProducts.length === 0) {
        throw new BadRequestException('Server Digiflazz tidak memiliki produk yang terhubung dengan produk ini');
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
