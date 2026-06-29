import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { PengumumanService } from '../../pengumuman/pengumuman.service';

@Injectable()
export class TransaksiPascabayarService {
  constructor(
    private prisma: PrismaService,
    private pengumumanService: PengumumanService
  ) {}

  async getRiwayatPascabayar(userId: number) {
    try {
      const transactions = await this.prisma.transactionPascabayar.findMany({
        where: {
          riwayatTransaksi: {
            memberId: userId,
          },
        },
        include: {
          produkPascabayar: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const listTransaksi: any = {};
      transactions.forEach((trx, index) => {
        listTransaksi[index.toString()] = {
          id: trx.id,
          kode_transaksi: trx.kode ?? '',
          nomor_tujuan: trx.nomorTujuan ?? '',
          nama_produk: trx.produkPascabayar ? trx.produkPascabayar.name : 'Unknown Produk',
          komisi: 'Rp ' + (trx.comission || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."),
          status: trx.status ?? 'proses',
          transaction_date: trx.createdAt.toISOString().replace(/T/, ' ').replace(/\..+/, ''),
          ket: trx.ket ?? '',
        };
      });

      return {
        error: false,
        error_msg: '',
        message: 'Riwayat pascabayar berhasil ditemukan',
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
        data: { list: {} },
      };
    }
  }

  async getDaftarKategoriPascabayar(kodeKategori: string) {
    try {
      if (!kodeKategori) {
        return {
          error: true,
          message: 'Kode kategori tidak boleh kosong',
          data: { list_kategori: [] },
        };
      }

      const kategori = await this.prisma.kategori.findFirst({
        where: { kode: kodeKategori },
        include: {
          produkPascabayars: {
            where: { status: 'active' },
          },
        },
      });

      if (!kategori) {
        return {
          error: true,
          message: 'Kategori tidak ditemukan',
          data: { list_kategori: [] },
        };
      }

      return {
        error: false,
        message: 'Data ditemukan',
        data: {
          list_kategori: kategori.produkPascabayars,
        },
      };
    } catch (error) {
      console.error(error);
      return {
        error: true,
        message: 'Internal server error',
        data: { list_kategori: [] },
      };
    }
  }

  async inquiryPascabayar(userId: number, product_code: string, nomor_tujuan: string) {
    try {
      // Cari produk pascabayar
      const produk = await this.prisma.produkPascabayar.findFirst({
        where: { kode: product_code },
      });

      if (!produk) {
        return {
          error: true,
          error_msg: 'Produk pascabayar tidak ditemukan',
          data: {},
        };
      }

      // Generate tagihan mock
      const nominalTagihan = Math.floor(Math.random() * 100000) + 50000;
      const adminFee = produk.fee || 2500;
      const totalTagihan = nominalTagihan + adminFee;
      
      const trId = 'TRX-' + Date.now();
      
      // Simpan inquiry ke TransactionPascabayar dengan status proses
      await this.prisma.transactionPascabayar.create({
        data: {
          trId: trId,
          kode: product_code,
          produkId: produk.id,
          nomorTujuan: nomor_tujuan,
          nominal: nominalTagihan,
          adminFee: adminFee,
          total: totalTagihan,
          totalNominal: totalTagihan,
          status: 'proses',
        },
      });

      return {
        error: false,
        error_msg: '',
        data: {
          ref_id: trId,
          tr_id: trId,
          kode_product: product_code,
          nomor_tujuan: nomor_tujuan,
          nama_pelanggan: 'Mock Customer',
          nominal: nominalTagihan.toString(),
          totalTagihan: totalTagihan.toString(),
          biaya_admin: adminFee.toString(),
          fee: '0',
        },
      };
    } catch (error) {
      console.error(error);
      return {
        error: true,
        error_msg: 'Gagal melakukan inquiry',
        data: {},
      };
    }
  }

  async pembayaranPascabayar(userId: number, trId: string) {
    try {
      return await this.prisma.$transaction(async (prisma) => {
        const trx = await prisma.transactionPascabayar.findFirst({
          where: { trId: trId },
        });

        if (!trx) {
          return { error: true, error_msg: 'Transaksi tidak ditemukan' };
        }

        if (trx.status === 'sukses') {
          return { error: true, error_msg: 'Transaksi ini sudah dibayar' };
        }

        const member = await prisma.member.findUnique({
          where: { id: userId },
        });

        if (!member) {
          return { error: true, error_msg: 'Member tidak ditemukan' };
        }

        const totalTagihan = trx.total || 0;
        const saldoLama = member.saldo || 0;
        if (saldoLama < totalTagihan) {
          return { error: true, error_msg: 'Saldo Anda tidak mencukupi' };
        }

        const saldoBaru = saldoLama - totalTagihan;

        // Potong Saldo
        await prisma.member.update({
          where: { id: userId },
          data: { saldo: saldoBaru },
        });

        // Catat Riwayat Saldo
        await prisma.riwayatSaldo.create({
          data: {
            kode: 'RWS-PASC-' + Date.now(),
            member_id: userId,
            nominal: totalTagihan,
            saldo_sebelumnya: saldoLama,
            saldo_setelahnya: saldoBaru,
            status: 'pembelian_pulsa', // Sesuai dengan enum yang ada (pembelian)
            ket: `Pembayaran Pascabayar ${trx.nomorTujuan}`,
          },
        });

        // Catat Riwayat Transaksi (Induk)
        const riwayat = await prisma.riwayatTransaksi.create({
          data: {
            memberId: userId,
            tipeTransaksi: 'beli_produk_pascabayar',
          },
        });

        // Update Transaksi Pascabayar
        await prisma.transactionPascabayar.update({
          where: { id: trx.id },
          data: {
            riwayatTransaksiId: riwayat.id,
            status: 'sukses',
          },
        });

        // Fire pengumuman
        this.pengumumanService.sendTransactionStatus(
            userId,
            'Pembayaran Pascabayar Berhasil',
            `Pembayaran Pascabayar untuk ${trx.nomorTujuan} telah berhasil.`,
            { transactionKode: trx.kode, status: 'sukses' }
        ).catch(e => console.error('Failed to send pengumuman', e));

        return {
          error: false,
          error_msg: '',
          message: 'Pembayaran Pascabayar Berhasil',
        };
      });
    } catch (error) {
      console.error(error);
      return {
        error: true,
        error_msg: 'Gagal melakukan pembayaran',
      };
    }
  }
}
