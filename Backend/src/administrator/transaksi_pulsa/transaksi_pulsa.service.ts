import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { GetTransaksiDto } from './dto/get-transaksi.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class TransaksiPulsaService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: GetTransaksiDto) {
    const { search, page = '1', limit = '10', status, start_date, end_date } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {};

    if (search) {
      where.OR = [
        { kode: { contains: search, mode: 'insensitive' } },
        { nomorTujuan: { contains: search, mode: 'insensitive' } },
        {
          riwayatTransaksi: {
            member: {
              fullname: { contains: search, mode: 'insensitive' },
            },
          },
        },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (start_date && end_date) {
      where.createdAt = {
        gte: new Date(start_date),
        lte: new Date(end_date),
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          riwayatTransaksi: {
            include: {
              member: true,
            },
          },
          produk: {
            include: {
              operator: true,
            },
          },
          server: true,
        },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    const totalPages = Math.ceil(total / take);

    return {
      list: data,
      total,
      page: Number(page),
      limit: take,
      totalPages,
    };
  }

  async findOne(id: number) {
    const transaksi = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        riwayatTransaksi: {
          include: {
            member: true,
          },
        },
        produk: {
          include: {
            operator: true,
          },
        },
        server: true,
        digiflazzTransactions: true,
      },
    });

    if (!transaksi) {
      throw new NotFoundException('Data transaksi tidak ditemukan');
    }

    return transaksi;
  }

  async runCronJob() {
    // Placeholder implementation for starting cron job
    return { message: 'Cron job pengecekan status berhasil dijalankan.' };
  }

  async checkStatusServer() {
    // Placeholder implementation for checking status from server (e.g., Digiflazz/Tripay)
    return { message: 'Pengecekan status transaksi di server pihak ketiga berhasil.' };
  }

  async create(createData: any) {
    // Sebagai mock untuk MVP jika diperlukan dari sisi Admin. 
    // Pada aslinya dipicu dari user member.
    throw new BadRequestException('Fungsi create dari admin belum tersedia secara penuh.');
  }

  async reCheckStatus(id: number) {
    const transaksi = await this.prisma.transaction.findUnique({ where: { id } });
    if (!transaksi) throw new NotFoundException('Data transaksi tidak ditemukan');
    // Mock re-check status
    return { message: `Permintaan pengecekan ulang status untuk transaksi #${id} berhasil dikirim.` };
  }

  async delete(id: number) {
    const transaksi = await this.prisma.transaction.findUnique({ where: { id } });
    if (!transaksi) throw new NotFoundException('Data transaksi tidak ditemukan');
    
    // Hanya bisa hapus jika status gagal atau proses
    if (transaksi.status !== 'gagal' && transaksi.status !== 'proses') {
      throw new BadRequestException('Hanya transaksi dengan status gagal atau proses yang dapat dihapus.');
    }

    await this.prisma.transaction.delete({ where: { id } });
    return true;
  }

  async updateStatus(id: number, updateDto: UpdateStatusDto) {
    const transaksi = await this.prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaksi) {
      throw new NotFoundException('Data transaksi tidak ditemukan');
    }

    const updated = await this.prisma.transaction.update({
      where: { id },
      data: {
        status: updateDto.status as any,
        ket: updateDto.keterangan || transaksi.ket,
      },
    });

    return updated;
  }
}
