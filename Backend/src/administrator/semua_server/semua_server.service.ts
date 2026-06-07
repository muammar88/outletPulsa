import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateSemuaServerDto } from './dto/create-semua-server.dto';
import { UpdateSemuaServerDto } from './dto/update-semua-server.dto';
import { ServerStatus } from '@prisma/client';

@Injectable()
export class SemuaServerService {
  constructor(private prisma: PrismaService) {}


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


}
