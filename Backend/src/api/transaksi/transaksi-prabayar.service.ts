import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateTransaksiPrabayarDto } from './dto/create-transaksi-prabayar.dto';

@Injectable()
export class TransaksiPrabayarService {
  private readonly logger = new Logger(TransaksiPrabayarService.name);

  constructor(private prisma: PrismaService) {}

  async createTransaksi(memberId: number, dto: CreateTransaksiPrabayarDto) {
    try {
      // 1. Dapatkan informasi produk dan server
      const produk = await this.prisma.produk.findFirst({
        where: { kode: dto.kode_produk, status: 'active' }, 
        include: { server: true }
      });

      if (!produk) {
        return { error: true, error_msg: 'Produk tidak ditemukan atau tidak aktif' };
      }

      // 2. Cek Member
      const member = await this.prisma.member.findUnique({
        where: { id: memberId }
      });

      if (!member) {
        return { error: true, error_msg: 'Member tidak ditemukan' };
      }

      const hargaModal = produk.purchase_price || 0;
      const markup = produk.markup || 0;
      const hargaJual = hargaModal + markup;

      // 3. Pengecekan saldo (Optimistic Check)
      if (member.saldo < hargaJual) {
        return { error: true, error_msg: 'Saldo member tidak mencukupi' };
      }

      const kodeTransaksi = `TRX${Date.now()}`;

      // 4. Proses Transaksi Database (Atomic / Transaction)
      // Potong saldo, catat ke riwayat, catat transaksi
      let newTrxId: number;
      let newSaldo: number;
      try {
        await this.prisma.$transaction(async (tx) => {
          // Potong saldo dengan Atomic Decrement
          const updateMember = await tx.member.update({
            where: { id: memberId },
            data: { saldo: { decrement: hargaJual } }
          });

          // Pengecekan setelah potong saldo (untuk mencegah saldo minus karena race condition)
          if (updateMember.saldo < 0) {
            throw new Error('InsufficientBalance');
          }

          newSaldo = updateMember.saldo;

          // Catat ke Riwayat Transaksi
          const riwayat = await tx.riwayatTransaksi.create({
            data: {
              memberId: memberId,
              tipeTransaksi: 'beli_produk_prabayar',
            }
          });

          // Catat ke tabel Transaction
          const trx = await tx.transaction.create({
            data: {
              kode: kodeTransaksi,
              type: 'prabayar',
              produkId: produk.id,
              riwayatTransaksiId: riwayat.id,
              nomorTujuan: dto.nomor_tujuan,
              purchase_price: hargaModal,
              selling_price: hargaJual,
              saldo_sebelum: member.saldo,
              saldo_sesudah: updateMember.saldo,
              serverId: produk.serverId,
              status: 'proses',
            }
          });

          newTrxId = trx.id;

          // Jika digiflazz, kita juga mencatat ke digiflazz_transaction
          if (produk.server?.kode === 'DIGI') {
            await tx.digiflazzTransaction.create({
              data: {
                transactionId: trx.id,
                status: 'proses',
              }
            });
          }
        });
      } catch (err: unknown) {
        if (err instanceof Error && err.message === 'InsufficientBalance') {
          return { error: true, error_msg: 'Saldo member tidak mencukupi' };
        }
        throw err;
      }

      // 5. Hit API Provider (Dummy integration untuk saat ini)
      this.logger.log(`Melakukan top-up ke server ${produk.server?.kode} untuk transaksi ${kodeTransaksi}`);
      const isTopUpSuccess = true; 
      const providerTrxId = Math.floor(Math.random() * 1000000);
      
      // Jika top-up sukses di-submit ke provider, simpan trx_id dari provider
      if (isTopUpSuccess) {
         await this.prisma.transaction.update({
           where: { id: newTrxId },
           data: { trx_id: providerTrxId }
         });
      } else {
         // Jika API call ke provider gagal total (contoh: timeout/500), 
         // idealnya memicu proses refund manual atau merubah status transaksi menjadi 'gagal'.
         // Di sini belum diimplementasikan karena provider aslinya menggunakan webhook.
      }

      return {
        error: false,
        error_msg: 'Proses Pembelian Berhasil Dilakukan',
        kodeTransaksi: kodeTransaksi
      };

    } catch (error) {
      this.logger.error('Error saat proses transaksi prabayar', error);
      return { error: true, error_msg: 'Terjadi kesalahan pada server saat memproses transaksi' };
    }
  }
}
