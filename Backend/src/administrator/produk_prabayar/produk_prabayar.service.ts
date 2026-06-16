import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateProdukPrabayarDto } from './dto/create-produk-prabayar.dto';
import { UpdateProdukPrabayarDto } from './dto/update-produk-prabayar.dto';
import { GetProdukPrabayarDto } from './dto/get-produk-prabayar.dto';
import { ProdukType, ProdukStatus } from '@prisma/client';

@Injectable()
export class ProdukPrabayarService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: GetProdukPrabayarDto) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const search = query.search || '';
    const status = query.status as ProdukStatus | undefined;
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

    if (operatorId) {
      where.operatorId = operatorId;
    }

    const [list, total] = await Promise.all([
      this.prisma.produk.findMany({
        where,
        skip,
        take: limit,
        orderBy: { purchase_price: 'asc' },
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

  async create(createProdukPrabayarDto: CreateProdukPrabayarDto) {
    // Check for existing produk with same kode
    const existing = await this.prisma.produk.findFirst({
      where: { kode: createProdukPrabayarDto.kode },
    });

    if (existing) {
      throw new BadRequestException(`Produk dengan kode ${createProdukPrabayarDto.kode} sudah terdaftar`);
    }

    const newProduk = await this.prisma.produk.create({
      data: {
        operatorId: createProdukPrabayarDto.operatorId,
        kode: createProdukPrabayarDto.kode,
        name: createProdukPrabayarDto.name,
        purchase_price: createProdukPrabayarDto.purchase_price || 0,
        markup: createProdukPrabayarDto.markup || 0,
        serverId: createProdukPrabayarDto.serverId,
        status: createProdukPrabayarDto.status || 'active',
      },
      include: {
        operator: true,
      }
    });

    return newProduk;
  }

  async update(id: number, updateProdukPrabayarDto: UpdateProdukPrabayarDto) {
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

    if (updateProdukPrabayarDto.kode) {
      const existing = await this.prisma.produk.findFirst({
        where: { kode: updateProdukPrabayarDto.kode, id: { not: id } },
      });
      if (existing) {
        throw new BadRequestException(`Produk dengan kode ${updateProdukPrabayarDto.kode} sudah terdaftar`);
      }
    }

    if (updateProdukPrabayarDto.serverId !== undefined && updateProdukPrabayarDto.serverId !== null) {
      const serverId = updateProdukPrabayarDto.serverId;
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
      data: updateProdukPrabayarDto,
      include: {
        operator: true,
      }
    });
  }

  async syncTermurah() {
    const produks = await this.prisma.produk.findMany({
      include: {
        iakPrabayarProduks: true,
        tripayPrabayarProduks: true,
        digiflazzProducts: true,
      },
    });

    let countSuccess = 0;
    let countDeactivated = 0;
    let countNoConnection = 0;
    let countFailed = 0;

    for (const p of produks) {
      try {
        const iakProducts = p.iakPrabayarProduks.filter(i => i.status === 'active' && i.price !== null && i.price !== undefined);
        const tripayProducts = p.tripayPrabayarProduks.filter(t => t.status?.toLowerCase() === 'active' && t.price !== null && t.price !== undefined);
        const digiProducts = p.digiflazzProducts.filter(d => d.status === 'active' && d.selectedSellerPrice !== null && d.selectedSellerPrice !== undefined);

        if (iakProducts.length === 0 && tripayProducts.length === 0 && digiProducts.length === 0) {
          // No connection or all inactive
          if (p.status !== 'inactive' || p.serverId !== null) {
            await this.prisma.produk.update({
              where: { id: p.id },
              data: { status: 'inactive', serverId: null },
            });
            countDeactivated++;
          } else {
            countNoConnection++;
          }
          continue;
        }

        let cheapestPrice = Infinity;
        let selectedServerId: number | null = null;

        // IAK = 1
        if (iakProducts.length > 0) {
          const cheapestIak = Math.min(...iakProducts.map(i => i.price!));
          if (cheapestIak < cheapestPrice) {
            cheapestPrice = cheapestIak;
            selectedServerId = 1;
          }
        }

        // Tripay = 2
        if (tripayProducts.length > 0) {
          const cheapestTripay = Math.min(...tripayProducts.map(t => t.price!));
          if (cheapestTripay < cheapestPrice) {
            cheapestPrice = cheapestTripay;
            selectedServerId = 2;
          }
        }

        // Digiflazz = 3
        if (digiProducts.length > 0) {
          const cheapestDigi = Math.min(...digiProducts.map(d => d.selectedSellerPrice!));
          if (cheapestDigi < cheapestPrice) {
            cheapestPrice = cheapestDigi;
            selectedServerId = 3;
          }
        }

        if (selectedServerId !== null) {
          await this.prisma.produk.update({
            where: { id: p.id },
            data: {
              serverId: selectedServerId,
              purchase_price: cheapestPrice,
              status: 'active',
            },
          });
          countSuccess++;
        } else {
          // Fallback if somehow no server selected (should not happen due to length check)
          await this.prisma.produk.update({
            where: { id: p.id },
            data: { status: 'inactive', serverId: null },
          });
          countDeactivated++;
        }
      } catch (err) {
        console.error(`Error updating produk ID ${p.id}:`, err);
        countFailed++;
      }
    }

    return {
      berhasil_diperbarui: countSuccess,
      dinonaktifkan: countDeactivated,
      tidak_ada_koneksi: countNoConnection,
      gagal: countFailed,
    };
  }

  async bulkUpdateStatus(ids: number[], status: 'active' | 'inactive') {
    let successCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    if (status === 'inactive') {
      try {
        const result = await this.prisma.produk.updateMany({
          where: { id: { in: ids } },
          data: { status: 'inactive' },
        });
        return { success: result.count, skipped: 0, failed: 0 };
      } catch (err) {
        console.error('Error bulk inactive:', err);
        return { success: 0, skipped: 0, failed: ids.length };
      }
    }

    // Active status validation
    const produks = await this.prisma.produk.findMany({
      where: { id: { in: ids } },
      include: {
        iakPrabayarProduks: true,
        tripayPrabayarProduks: true,
        digiflazzProducts: true,
      },
    });

    for (const p of produks) {
      try {
        const hasProvider = p.iakPrabayarProduks.length > 0 || p.tripayPrabayarProduks.length > 0 || p.digiflazzProducts.length > 0;
        
        if (!hasProvider) {
          skippedCount++;
          continue;
        }

        await this.prisma.produk.update({
          where: { id: p.id },
          data: { status: 'active' },
        });
        successCount++;
      } catch (err) {
        console.error(`Error bulk activating produk ID ${p.id}:`, err);
        failedCount++;
      }
    }

    return {
      success: successCount,
      skipped: skippedCount,
      failed: failedCount,
    };
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.produk.delete({
      where: { id },
    });
  }
}
