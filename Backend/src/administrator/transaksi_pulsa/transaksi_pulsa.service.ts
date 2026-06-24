import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { GetTransaksiDto } from './dto/get-transaksi.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { IakService } from '../../providers/iak.service';
import { DigiflazzService } from '../../providers/digiflazz.service';
import { TripayService } from '../../providers/tripay.service';

@Injectable()
export class TransaksiPulsaService {
  private readonly logger = new Logger(TransaksiPulsaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly iakService: IakService,
    private readonly digiflazzService: DigiflazzService,
    private readonly tripayService: TripayService,
  ) {}

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
    await this.checkStatusServer();
    return { message: 'Cron job pengecekan status berhasil dijalankan.' };
  }

  async checkStatusServer() {
    const prosesTransactions = await this.prisma.transaction.findMany({
      where: { status: 'proses' }
    });

    let successCount = 0;
    let failedCount = 0;

    for (const trx of prosesTransactions) {
      try {
        await this.reCheckStatus(trx.id);
        successCount++;
      } catch (error) {
        this.logger.error(`Error checking status for TRX ID ${trx.id}:`, error);
        failedCount++;
      }
    }

    return { message: `Pengecekan massal selesai. ${successCount} berhasil, ${failedCount} gagal diproses.` };
  }

  async create(createData: any) {
    // Sebagai mock untuk MVP jika diperlukan dari sisi Admin. 
    // Pada aslinya dipicu dari user member.
    throw new BadRequestException('Fungsi create dari admin belum tersedia secara penuh.');
  }

  async reCheckStatus(id: number) {
    const transaksi = await this.prisma.transaction.findUnique({ 
      where: { id },
      include: {
        server: true,
        riwayatTransaksi: { include: { member: true } },
        produk: true
      }
    });

    if (!transaksi) throw new NotFoundException('Data transaksi tidak ditemukan');

    if (transaksi.status === 'sukses' || transaksi.status === 'gagal' || transaksi.status === 'expired') {
       return { message: 'Transaksi sudah memiliki status final.' };
    }

    let statusProvider = 'proses';
    let sn = '';

    if (!transaksi.serverId || !transaksi.server) {
      statusProvider = 'gagal';
      sn = 'Tanpa Provider / Server belum dikonfigurasi';
    } else {
      const serverName = transaksi.server.name?.toLowerCase() || '';
      if (serverName.includes('iak')) {
        const res = await this.iakService.checkStatus(transaksi.kode || '');
        statusProvider = res.status;
        sn = res.sn;
      } else if (serverName.includes('digiflazz')) {
        const res = await this.digiflazzService.checkStatus(transaksi.kode || '', transaksi.nomorTujuan || '', transaksi.produk?.kode || '');
        statusProvider = res.status;
        sn = res.sn;
      } else if (serverName.includes('tripay')) {
        const res = await this.tripayService.checkStatus(transaksi.trx_id?.toString() || '', transaksi.kode || '');
        statusProvider = res.status;
        sn = res.sn;
      } else {
        statusProvider = 'gagal';
        sn = 'Provider tidak dikenali';
      }
    }

    if (statusProvider === 'proses') {
      return { message: `Transaksi #${id} masih dalam status proses di server.` };
    }

    await this.prisma.$transaction(async (prisma) => {
      // Re-fetch untuk lock
      const currentTrx = await prisma.transaction.findUnique({
         where: { id }
      });

      if (!currentTrx || currentTrx.status !== 'proses') {
         return; 
      }

      if (statusProvider === 'sukses') {
         await prisma.transaction.update({
           where: { id },
           data: {
             status: 'sukses',
             ket: sn ? `SN: ${sn}` : currentTrx.ket,
             serial_number: sn ? String(sn) : undefined,
           }
         });
      } else if (statusProvider === 'gagal') {
         await prisma.transaction.update({
           where: { id },
           data: {
             status: 'gagal',
             ket: sn ? `Gagal: ${sn}` : 'Gagal dari server provider',
             serial_number: sn ? String(sn) : undefined,
           }
         });

         const isRefundEligible = currentTrx.saldo_sebelum !== null && currentTrx.saldo_sesudah !== null;
         if (isRefundEligible && transaksi.riwayatTransaksi?.member) {
            const memberId = transaksi.riwayatTransaksi.member.id;
            const currentMember = await prisma.member.findUnique({ where: { id: memberId } });
            
            if (currentMember) {
               const sellingPrice = currentTrx.selling_price || 0;
               const feeAgen = currentTrx.fee_agen || 0;
               const nominalRefund = sellingPrice + feeAgen;
               const saldoBaru = (currentMember.saldo || 0) + nominalRefund;

               await prisma.member.update({
                 where: { id: memberId },
                 data: { saldo: saldoBaru }
               });

               await prisma.riwayatSaldo.create({
                 data: {
                   kode: `REF-${currentTrx.kode || Date.now()}`,
                   member_id: memberId,
                   nominal: nominalRefund,
                   saldo_sebelumnya: currentMember.saldo || 0,
                   saldo_setelahnya: saldoBaru,
                   status: 'deposit',
                   riwayat_transaksi_id: currentTrx.riwayatTransaksiId,
                   ket: `Pengembalian dana transaksi gagal ${currentTrx.nomorTujuan} (${currentTrx.kode})`
                 }
               });
            }
         }
      }
    });

    return { message: `Pengecekan status untuk transaksi #${id} selesai dengan hasil: ${statusProvider}` };
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
