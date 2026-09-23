import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { GetTransaksiDto } from './dto/get-transaksi.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { IakService } from '../../providers/iak.service';
import { DigiflazzService } from '../../providers/digiflazz.service';
import { TripayService } from '../../providers/tripay.service';
import { TransaksiFinalizerService } from '../../api/transaksi/transaksi-finalizer.service';

@Injectable()
export class TransaksiPulsaService {
  private readonly logger = new Logger(TransaksiPulsaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly iakService: IakService,
    private readonly digiflazzService: DigiflazzService,
    private readonly tripayService: TripayService,
    private readonly transaksiFinalizer: TransaksiFinalizerService,
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
    // B2: Harga aktual dari provider untuk audit laba yang benar
    let actualPurchasePrice: number | undefined;

    if (!transaksi.serverId || !transaksi.server) {
      statusProvider = 'gagal';
      sn = 'Tanpa Provider / Server belum dikonfigurasi';
    } else {
      const serverCode = transaksi.server.kode?.toUpperCase() || '';
      const serverName = transaksi.server.name?.toLowerCase() || '';

      if (serverCode === 'IAK' || serverName.includes('iak')) {
        const res = await this.iakService.checkStatus(transaksi.kode || '');
        statusProvider = res.status;
        sn = res.sn;
        // B2: Ambil harga aktual dari raw response IAK
        const iakRawPrice = res.raw?.data?.price;
        if (typeof iakRawPrice === 'number' && iakRawPrice > 0) actualPurchasePrice = iakRawPrice;
      } else if (serverCode === 'DIGI' || serverName.includes('digiflazz')) {
        let sku = '';
        const match = transaksi.ket?.match(/\[SNAPSHOT:(\{.*?\})\]/);
        if (match) {
          try {
            const snap = JSON.parse(match[1]);
            sku = snap.sku || '';
          } catch {}
        }
        if (!sku) {
          const digiMapping = await this.prisma.digiflazzProduct.findFirst({ where: { produkId: transaksi.produkId } });
          sku = digiMapping?.selectedSellerBuyerSkuKode || transaksi.produk?.kode || '';
        }
        const res = await this.digiflazzService.checkStatus(transaksi.kode || '', transaksi.nomorTujuan || '', sku);
        statusProvider = res.status;
        sn = res.sn;
        // B2: Ambil harga aktual dari raw response Digiflazz
        const digiRawPrice = res.raw?.data?.price;
        if (typeof digiRawPrice === 'number' && digiRawPrice > 0) actualPurchasePrice = digiRawPrice;
      } else if (serverCode === 'TRI' || serverName.includes('tripay')) {
        const res = await this.tripayService.checkStatus(transaksi.trx_id?.toString() || '', transaksi.kode || '');
        statusProvider = res.status;
        sn = res.sn;
        // B2: Ambil harga aktual dari raw response Tripay
        const triRawPrice = res.raw?.data?.price;
        if (typeof triRawPrice === 'number' && triRawPrice > 0) actualPurchasePrice = triRawPrice;
      } else {
        statusProvider = 'gagal';
        sn = 'Provider tidak dikenali';
      }
    }

    if (statusProvider === 'proses') {
      return { message: `Transaksi #${id} masih dalam status proses di server.` };
    }

    const finalizeRes = await this.transaksiFinalizer.finalizeTransaction({
      transactionId: id,
      targetStatus: statusProvider as 'sukses' | 'gagal',
      sn: sn,
      // B2: Teruskan harga aktual ke finalizer untuk kalkulasi laba berdasarkan modal riil
      actualPurchasePrice,
      source: 'ADMIN_RECHECK',
    });

    return { message: `Pengecekan status untuk transaksi #${id} selesai dengan hasil: ${finalizeRes.status}` };
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
    const targetStatus = updateDto.status;
    if (targetStatus !== 'sukses' && targetStatus !== 'gagal' && targetStatus !== 'proses') {
      throw new BadRequestException(`Status '${targetStatus}' tidak valid.`);
    }

    // 1. Cabang targetStatus === 'proses' (Mencegah membuka status final kembali)
    if (targetStatus === 'proses') {
      // Update bersyarat di DB yang HANYA cocok jika status transaksi saat ini masih 'proses'
      const claim = await this.prisma.transaction.updateMany({
        where: {
          id,
          status: 'proses',
        },
        data: {
          ket: updateDto.keterangan !== undefined ? updateDto.keterangan : undefined,
          updatedAt: new Date(),
        },
      });

      if (claim.count === 0) {
        const currentTx = await this.prisma.transaction.findUnique({
          where: { id },
        });

        if (!currentTx) {
          throw new NotFoundException('Data transaksi tidak ditemukan');
        }

        // Transaksi sudah berstatus final (sukses, gagal, expired) tidak boleh dibuka ulang
        throw new ConflictException(
          `Transaksi #${id} sudah berstatus final '${currentTx.status}' dan tidak dapat dibuka kembali ke 'proses'`,
        );
      }

      return await this.prisma.transaction.findUnique({
        where: { id },
      });
    }

    // 2. Cabang targetStatus === 'sukses' atau 'gagal' (Finalisasi manual oleh admin)
    const currentTx = await this.prisma.transaction.findUnique({
      where: { id },
    });

    if (!currentTx) {
      throw new NotFoundException('Data transaksi tidak ditemukan');
    }

    // Cegah konflik jika sudah berstatus final dengan status berbeda
    if (currentTx.status === 'sukses' || currentTx.status === 'gagal' || currentTx.status === 'expired') {
      if (currentTx.status !== targetStatus) {
        throw new ConflictException(
          `Transaksi #${id} sudah berstatus final '${currentTx.status}' dan tidak dapat diubah menjadi '${targetStatus}'`,
        );
      }
      return currentTx;
    }

    const finalizeRes = await this.transaksiFinalizer.finalizeTransaction({
      transactionId: id,
      targetStatus: targetStatus as 'sukses' | 'gagal',
      ket: updateDto.keterangan || undefined,
      source: 'ADMIN_MANUAL_UPDATE',
    });

    if (finalizeRes.alreadyFinal && finalizeRes.status !== targetStatus) {
      throw new ConflictException(
        `Transaksi #${id} sudah berstatus final '${finalizeRes.status}' dan tidak dapat diubah menjadi '${targetStatus}'`,
      );
    }

    return finalizeRes.transaction || currentTx;
  }
}
