import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { GetBankDto } from './dto/get-bank.dto';

@Injectable()
export class BankService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: GetBankDto) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const search = query.search || '';
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { kode: { contains: search, mode: 'insensitive' } },
        { nama: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [list, total] = await Promise.all([
      this.prisma.bank.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        include: {
          _count: {
            select: { bankTransferOutlets: true, riwayatMutasis: true }
          }
        },
      }),
      this.prisma.bank.count({ where }),
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
    const bank = await this.prisma.bank.findUnique({
      where: { id },
      include: {
        _count: {
          select: { bankTransferOutlets: true, riwayatMutasis: true }
        }
      },
    });

    if (!bank) {
      throw new NotFoundException(`Bank dengan ID ${id} tidak ditemukan`);
    }

    return bank;
  }

  async create(createBankDto: CreateBankDto) {
    const existing = await this.prisma.bank.findFirst({
      where: { kode: createBankDto.kode },
    });

    if (existing) {
      throw new BadRequestException(`Bank dengan kode ${createBankDto.kode} sudah terdaftar`);
    }

    return this.prisma.bank.create({
      data: createBankDto,
    });
  }

  async update(id: number, updateBankDto: UpdateBankDto) {
    await this.findOne(id); // Ensure exists

    if (updateBankDto.kode) {
      const existing = await this.prisma.bank.findFirst({
        where: { kode: updateBankDto.kode, id: { not: id } },
      });
      if (existing) {
        throw new BadRequestException(`Bank dengan kode ${updateBankDto.kode} sudah terdaftar`);
      }
    }

    return this.prisma.bank.update({
      where: { id },
      data: updateBankDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    try {
      return await this.prisma.bank.delete({
        where: { id },
      });
    } catch (error: any) {
      if (error.code === 'P2003') {
        throw new BadRequestException('Tidak dapat menghapus bank karena sedang digunakan oleh entitas lain (contoh: bank transfer outlet atau riwayat mutasi).');
      }
      throw new BadRequestException('Gagal menghapus bank');
    }
  }
}
