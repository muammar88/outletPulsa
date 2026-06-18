import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateSemuaServerDto } from './dto/create-semua-server.dto';
import { UpdateSemuaServerDto } from './dto/update-semua-server.dto';
import { ServerStatus } from '@prisma/client';
import { IakService } from '../../providers/iak.service';
import { DigiflazzService } from '../../providers/digiflazz.service';
import { TripayService } from '../../providers/tripay.service';

@Injectable()
export class SemuaServerService {
  constructor(
    private prisma: PrismaService,
    private iakService: IakService,
    private digiflazzService: DigiflazzService,
    private tripayService: TripayService
  ) {}


  async findAll(search: string = '', limit: number = 10, page: number = 1, status: string = '') {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { kode: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) {
      where.status = status as ServerStatus;
    }

    const [total, servers] = await Promise.all([
      this.prisma.server.count({ where }),
      this.prisma.server.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { id: 'desc' },
        include: {
          _count: {
            select: {
              produks: true,
              produkPascabayars: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      statusCode: 200,
      message: 'Berhasil mengambil daftar server',
      data: {
        list: servers,
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(id: number) {
    const server = await this.prisma.server.findUnique({
      where: { id },
    });

    if (!server) {
      throw new NotFoundException(`Server dengan ID ${id} tidak ditemukan`);
    }

    return {
      statusCode: 200,
      message: 'Berhasil mengambil detail server',
      data: server,
    };
  }

  async update(id: number, updateSemuaServerDto: UpdateSemuaServerDto) {
    const server = await this.prisma.server.findUnique({ where: { id } });
    if (!server) {
      throw new NotFoundException(`Server dengan ID ${id} tidak ditemukan`);
    }

    try {
      const updatedServer = await this.prisma.server.update({
        where: { id },
        data: updateSemuaServerDto,
      });

      return {
        statusCode: 200,
        message: 'Server berhasil diperbarui',
        data: updatedServer,
      };
    } catch (error) {
      throw new BadRequestException('Gagal memperbarui server');
    }
  }

  async getBalances() {
    // Ambil server aktif
    const servers = await this.prisma.server.findMany({
      where: { status: 'active' }
    });

    const crypto = require('crypto');

    // Jalankan request parallel
    const promises = servers.map(async (server) => {
      let balance = 0;
      let isSuccess = false;
      let errorMsg: string | null = null;

      try {
        if (server.kode === 'DIGI') {
          const res = await this.digiflazzService.checkBalance();
          balance = res.balance;
          isSuccess = res.isSuccess;
          if (!isSuccess) errorMsg = res.errorMsg;
        } 
        else if (server.kode === 'IAK') {
          const res = await this.iakService.checkBalance();
          balance = res.balance;
          isSuccess = res.isSuccess;
          if (!isSuccess) errorMsg = res.errorMsg;
        }
        else if (server.kode === 'TRI') {
          const res = await this.tripayService.checkBalance();
          balance = res.balance;
          isSuccess = res.isSuccess;
          if (!isSuccess) errorMsg = res.errorMsg;
        } else {
          isSuccess = true;
          balance = 0;
        }
      } catch (err: any) {
        errorMsg = err.message;
      }

      return {
        id: server.id,
        kode: server.kode,
        name: server.name,
        status: isSuccess ? 'success' : 'error',
        balance,
        message: errorMsg,
        lastUpdated: new Date().toISOString()
      };
    });

    const results = await Promise.allSettled(promises);
    
    const finalData = results.map((result: any) => {
      if (result.status === 'fulfilled') return result.value;
      return { status: 'error', balance: 0, message: 'Promise rejected' };
    });

    return {
      statusCode: 200,
      message: 'Berhasil mengambil saldo server',
      data: finalData
    };
  }

}
