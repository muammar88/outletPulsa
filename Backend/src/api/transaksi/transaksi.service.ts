import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class TransaksiService {
  constructor(private prisma: PrismaService) {}

  async getRiwayatPrabayar(userId: number) {
    try {
      const transactions = await this.prisma.transaction.findMany({
        where: {
          type: 'prabayar',
          riwayatTransaksi: {
            memberId: userId,
          },
        },
        include: {
          produk: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Format to Map structure to be robust if needed, but since we updated
      // Model_list to support arrays, we can just return the array safely!
      const listTransaksi: any = {};
      transactions.forEach((trx, index) => {
        listTransaksi[index.toString()] = {
          id: trx.id,
          kode_transaksi: trx.kode ?? '',
          nomor_tujuan: trx.nomorTujuan ?? '',
          name_produk: trx.produk ? trx.produk.name : 'Unknown Produk',
          selling_price: 'Rp ' + (trx.selling_price || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."),
          status: trx.status ?? 'proses',
          transaction_date: trx.createdAt.toISOString().replace(/T/, ' ').replace(/\..+/, ''),
          ket: trx.ket ?? '',
        };
      });

      return {
        error: false,
        error_msg: '',
        message: 'Riwayat prabayar berhasil ditemukan',
        data: {
          list: listTransaksi,
        },
      };
    } catch (error) {
      console.error(error);
      return {
        error: true,
        error_msg: 'Gagal mengambil data riwayat',
        message: 'Terjadi kesalahan pada server',
        data: { list: [] },
      };
    }
  }
}
