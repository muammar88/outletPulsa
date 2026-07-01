import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateTransaksiPrabayarDto } from './dto/create-transaksi-prabayar.dto';
import { IakService } from '../../providers/iak.service';
import { DigiflazzService } from '../../providers/digiflazz.service';
import { TripayService } from '../../providers/tripay.service';
import { PengumumanService } from '../../pengumuman/pengumuman.service';

@Injectable()
export class TransaksiService {
  private readonly logger = new Logger(TransaksiService.name);

  constructor(
    private prisma: PrismaService,
    private iakService: IakService,
    private digiflazzService: DigiflazzService,
    private tripayService: TripayService,
    private pengumumanService: PengumumanService
  ) {}

  async getRiwayatPrabayar(userId: number, search?: string) {
    try {
      const transactions = await this.prisma.transaction.findMany({
        where: {
          type: 'prabayar',
          riwayatTransaksi: {
            memberId: userId,
          },
          ...(search ? {
            OR: [
              { nomorTujuan: { contains: search } },
              { kode: { contains: search } },
              { produk: { name: { contains: search } } }
            ]
          } : {})
        },
        include: {
          produk: true,
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
          name_produk: trx.produk ? trx.produk.name : 'Unknown Produk',
          selling_price: 'Rp ' + (trx.selling_price || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."),
          fee_agen: trx.fee_agen || 0,
          selling_price_raw: trx.selling_price || 0,
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
      this.logger.error('Error saat mengambil riwayat', error);
      return {
        error: true,
        error_msg: 'Gagal mengambil data riwayat',
        message: 'Terjadi kesalahan pada server',
        data: { list: [] },
      };
    }
  }

  async createTransaksiPrabayar(memberId: number, dto: CreateTransaksiPrabayarDto) {
    try {

      console.log("-----------------1");
      // 1. Dapatkan informasi produk dan server
      const produk = await this.prisma.produk.findFirst({
        where: { kode: dto.kode_produk, status: 'active' }, 
        include: { server: true }
      });

      console.log("-----------------2");
      console.log("Produk", produk);
      console.log("-----------------2");
      if (!produk) {
        return { error: true, error_msg: 'Produk tidak ditemukan atau tidak aktif' };
      }

      console.log("-----------------3");
      console.log("Produk", produk);
      console.log("-----------------3");

      // === NEW LOGIC: FIND MAPPING ===
      let providerProductCode = '';
      if (produk.server?.kode === 'IAK') {
        const iakMapping = await this.prisma.iakPrabayarProduk.findFirst({
          where: { produkId: produk.id }
        });
        if (!iakMapping || !iakMapping.kode) {
          return { error: true, error_msg: 'Mapping produk untuk provider IAK tidak ditemukan' };
        }
        providerProductCode = iakMapping.kode;
      } else if (produk.server?.kode === 'TRI') {
        const triMapping = await this.prisma.tripayPrabayarProduk.findFirst({
          where: { produkId: produk.id }
        });
        if (!triMapping || !triMapping.kode) {
          return { error: true, error_msg: 'Mapping produk untuk provider TRIPAY tidak ditemukan' };
        }
        providerProductCode = triMapping.kode;
      } else if (produk.server?.kode === 'DIGI') {
        const digiMapping = await this.prisma.digiflazzProduct.findFirst({
          where: { produkId: produk.id }
        });
        if (!digiMapping || !digiMapping.selectedSellerBuyerSkuKode) {
          return { error: true, error_msg: 'Mapping produk untuk provider DIGIFLAZZ tidak ditemukan' };
        }
        providerProductCode = digiMapping.selectedSellerBuyerSkuKode;
      } else {
        return { error: true, error_msg: 'Server provider tidak dikenali' };
      }
      
      console.log("-----------------MAPPING");
      console.log("Provider Product Code", providerProductCode);
      console.log("-----------------MAPPING");

      // 2. Cek Member
      const member = await this.prisma.member.findUnique({
        where: { id: memberId }
      });

      console.log("-----------------4");
      console.log("Member", member);
      console.log("-----------------4");

      if (!member) {
        return { error: true, error_msg: 'Member tidak ditemukan' };
      }

      const isReseller = !!member.kode_agen;

      const hargaModal = produk.purchase_price || 0;
      const markup = produk.markup || 0;
      const hargaJualAsli = hargaModal + markup;
      let totalBayar = hargaJualAsli;

      if (isReseller) {
        totalBayar += 20;
      }

      console.log("-----------------5");
      console.log("Harga Modal", hargaModal);
      console.log("Harga Jual Asli", hargaJualAsli);
      console.log("Total Bayar", totalBayar);
      console.log("-----------------5");

      // 3. Pengecekan saldo (Optimistic Check)
      const currentSaldo = member.saldo ?? 0;
      if (currentSaldo < totalBayar) {
        return { error: true, error_msg: 'Saldo member tidak mencukupi' };
      }

      const kodeTransaksi = `TRX${Date.now()}`;

      console.log("-----------------6");
      console.log("Kode Transaksi", kodeTransaksi);
      console.log("-----------------6");

      // 4. Proses Transaksi Database (Atomic / Transaction)
      // Potong saldo, catat ke riwayat, catat transaksi
      let newTrxId: number = 0;
      let newSaldo: number = 0;
      try {
        await this.prisma.$transaction(async (tx) => {

          console.log("-----------------6.1");
          console.log("Total Bayar", totalBayar);
          console.log("-----------------6.1");
          // Potong saldo dengan Atomic Decrement
          const updateMember = await tx.member.update({
            where: { id: memberId },
            data: { saldo: { decrement: totalBayar } }
          });

          console.log("-----------------6.2");
          console.log("updateMember", updateMember);
          console.log("-----------------6.2");

          // Pengecekan setelah potong saldo (untuk mencegah saldo minus karena race condition)
          const updatedSaldo = updateMember.saldo ?? 0;
          if (updatedSaldo < 0) {
            throw new Error('InsufficientBalance');
          }

          newSaldo = updatedSaldo;

          console.log("-----------------6.3");
          console.log("updatedSaldo", updatedSaldo);
          console.log("-----------------6.3");

          // Catat ke Riwayat Transaksi
          const riwayat = await tx.riwayatTransaksi.create({
            data: {
              memberId: memberId,
              tipeTransaksi: 'beli_produk_prabayar',
            }
          });

          // Catat ke tabel Transaction
          const transactionData: any = {
            kode: kodeTransaksi,
            type: 'prabayar',
            produkId: produk.id,
            riwayatTransaksiId: riwayat.id,
            nomorTujuan: dto.nomor_tujuan,
            purchase_price: hargaModal,
            selling_price: hargaJualAsli,
            saldo_sebelum: currentSaldo,
            saldo_sesudah: updatedSaldo,
            serverId: produk.serverId,
            status: 'proses',
          };

          if (isReseller) {
            transactionData.fee_agen = 20;
            transactionData.status_fee_agen = 'unpaid';
            transactionData.kodeAgen = member.kode_agen;
          }

          const trx = await tx.transaction.create({
            data: transactionData
          });

          newTrxId = trx.id;

          console.log("-----------------6.4");
          console.log("trx", trx);
          console.log("-----------------6.4");

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

      console.log("---------KODE--------~~~");
      console.log(produk.server?.kode);
      console.log("---------KODE--------~~~");

      // 5. Hit API Provider
      this.logger.log(`Melakukan top-up ke server ${produk.server?.kode} untuk transaksi ${kodeTransaksi}`);
      let providerResponse: any;

      if (produk.server?.kode === 'IAK') {
        console.log("---------IAK--------7");
        providerResponse = await this.iakService.topUp(kodeTransaksi, dto.nomor_tujuan, providerProductCode);
        console.log("---------IAK--------7");
        console.log(providerResponse);
        console.log("---------IAK--------7");
      } else if (produk.server?.kode === 'TRI') {
        console.log("---------TRI--------8");
        const isPln = dto.kode_produk.toUpperCase().includes('PLN') || providerProductCode.toUpperCase().includes('PLN'); // Atur cara cek PLN sesuai struktur data yang fix
        providerResponse = await this.tripayService.topUp(kodeTransaksi, dto.nomor_tujuan, providerProductCode, isPln);
        console.log("---------TRI--------8");
        console.log(providerResponse);
        console.log("---------TRI--------8");
      } else if (produk.server?.kode === 'DIGI') {
        console.log("---------DIGI--------9");
        providerResponse = await this.digiflazzService.topUp(kodeTransaksi, dto.nomor_tujuan, providerProductCode);
        console.log("---------DIGI--------9");
        console.log(providerResponse);
        console.log("---------DIGI--------9");
      } else {
        // Fallback jika tidak dikenali
        providerResponse = { status_success: false, trx_id: '' };
      }
      
      // Jika top-up sukses di-submit ke provider, simpan trx_id dari provider
      if (providerResponse.status_success || providerResponse.trx_id) {
         await this.prisma.transaction.update({
           where: { id: newTrxId },
           data: { 
             trx_id: providerResponse.trx_id ? parseInt(String(providerResponse.trx_id), 10) : undefined,
             serial_number: providerResponse.sn ? String(providerResponse.sn) : undefined
           }
         });
      } else {
         // Jika gagal API call ke provider, sistem tetap menunggu webhook 
         // atau kita bisa langsung ubah status menjadi gagal jika response mutlak gagal.
         // Sesuai sistem lama, kita pasrahkan ke webhook.
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

  async getDetailTransaksiPrabayar(memberId: number, kodeTransaksi: string) {
    try {
      let trx = await this.prisma.transaction.findFirst({
        where: {
          kode: kodeTransaksi,
          riwayatTransaksi: {
            memberId: memberId,
          },
        },
        include: {
          produk: true,
          server: true,
          riwayatTransaksi: true,
        },
      });

      if (!trx) {
        return {
          error: true,
          error_msg: 'Detail Transaksi Tidak Ditemukan',
        };
      }

      // --- NEW LOGIC: Realtime status check ---
      if (trx.status === 'proses') {
        let checkRes: { status: string; sn: string; raw: any } | null = null;
        
        if (trx.server?.kode === 'IAK') {
           checkRes = await this.iakService.checkStatus(trx.kode || '');
        } else if (trx.server?.kode === 'TRI') {
           checkRes = await this.tripayService.checkStatus(trx.trx_id?.toString() || '', trx.kode || '');
        } else if (trx.server?.kode === 'DIGI') {
           let providerProductCode = '';
           const digiMapping = await this.prisma.digiflazzProduct.findFirst({ where: { produkId: trx.produkId } });
           if (digiMapping) providerProductCode = digiMapping.selectedSellerBuyerSkuKode || '';
           checkRes = await this.digiflazzService.checkStatus(trx.kode || '', trx.nomorTujuan || '', providerProductCode);
        }

        if (checkRes && checkRes.status !== 'proses') {
           let newKet = trx.ket;
           let realPurchasePrice = trx.purchase_price;
           
           if (checkRes.status === 'sukses') {
              if (checkRes.sn) {
                 const isPlnProduct = trx.produk?.kode?.toUpperCase().includes('PLN') || trx.produk?.name?.toUpperCase().includes('PLN');
                 if (trx.server?.kode === 'DIGI' && !isPlnProduct) {
                    newKet = "SN : " + checkRes.sn;
                 } else {
                    newKet = checkRes.sn;
                 }
              }

              // Ambil harga modal dari response raw masing-masing provider
              const rawData = checkRes.raw?.data;
              if (rawData && rawData.price !== undefined) {
                 realPurchasePrice = Number(rawData.price);
              }
           }
           
           let calculatedLaba: number | null = trx.laba;
           if (checkRes.status === 'sukses') {
               const sellingPrice = trx.selling_price || 0;
               calculatedLaba = sellingPrice - (realPurchasePrice || 0);
           }

           // Proses update status transaksi, refund (jika gagal), dan update serial_number dalam satu prisma.$transaction()
           trx = await this.prisma.$transaction(async (tx) => {
               // Jika status menjadi gagal, kembalikan saldo
               if (checkRes!.status === 'gagal') {
                   const feeAgenRefund = trx!.fee_agen || 0;
                   const refundAmount = (trx!.selling_price || 0) + feeAgenRefund;
                   await tx.member.update({
                       where: { id: memberId },
                       data: { saldo: { increment: refundAmount } }
                   });
                   await tx.riwayatTransaksi.create({
                       data: {
                          memberId: memberId,
                          tipeTransaksi: 'terima_saldo',
                       }
                   });
               }

               return await tx.transaction.update({
                 where: { id: trx!.id },
                 data: {
                   status: checkRes!.status as any,
                   ket: newKet || trx!.ket,
                   purchase_price: realPurchasePrice,
                   laba: calculatedLaba,
                   serial_number: checkRes!.sn ? String(checkRes!.sn) : undefined,
                 },
                 include: {
                   produk: true,
                   server: true,
                   riwayatTransaksi: true,
                 }
               }) as any;
           });

           // Fire pengumuman after db transaction succeeds
           if (checkRes!.status === 'sukses' || checkRes!.status === 'gagal') {
               const statusText = checkRes!.status === 'sukses' ? 'Berhasil' : 'Gagal';
               this.pengumumanService.sendTransactionStatus(
                   memberId,
                   `Transaksi ${statusText}`,
                   `Pembelian ${trx!.produk?.name || ''} untuk ${trx!.nomorTujuan || ''} telah ${statusText.toLowerCase()}.`,
                   { 
                       reference_id: trx!.kode || String(trx!.id), 
                       status: checkRes!.status 
                   },
                   'prabayar'
               ).catch(e => this.logger.error('Failed to send pengumuman', e));
           }
        }
      }
      // --- END Realtime status check ---

      // Format data kembalian
      const currentTrx = trx!;
      const isPln = currentTrx.produk?.kode?.toUpperCase().includes('PLN') || currentTrx.produk?.name?.toUpperCase().includes('PLN');
      const isSukses = currentTrx.status === 'sukses';
      const print_status = isSukses && isPln;

      let print_tanggal = '-';
      let print_waktu = '-';
      let print_id_pelanggan = '-';
      let print_nama = '-';
      let print_tarif_daya = '-';
      let print_nominal = '-';
      let print_jml_kwh = '-';
      let print_token = '-';

      if (currentTrx.ket && print_status) {
        const text = currentTrx.ket;
        const myArray = text.split('/');
        const productNameArray = currentTrx.produk?.name?.split(' ') || [];
        
        if (currentTrx.server?.kode === 'IAK' && myArray.length >= 5) {
          // format: token / nama / tarif / daya / kwh
          print_tanggal = currentTrx.updatedAt.toISOString().split('T')[0];
          print_waktu = currentTrx.updatedAt.toTimeString().split(' ')[0];
          print_token = myArray[0].trim();
          print_nama = myArray[1].trim();
          print_tarif_daya = myArray[2] + '/' + myArray[3];
          print_jml_kwh = myArray[4];
          print_id_pelanggan = currentTrx.nomorTujuan || '-';
          print_nominal = productNameArray.length >= 3 ? productNameArray[2] : '-';
        } else if (currentTrx.server?.kode === 'TRI' && myArray.length >= 5) {
          // format: SN:token / nama / tarif / daya / kwh
          const getToken = myArray[0].split(':');
          print_tanggal = currentTrx.updatedAt.toISOString().split('T')[0];
          print_waktu = currentTrx.updatedAt.toTimeString().split(' ')[0];
          print_token = getToken.length > 1 ? getToken[1].trim() : getToken[0].trim();
          print_nama = myArray[1].trim();
          print_tarif_daya = myArray[2] + '/' + myArray[3];
          print_jml_kwh = myArray[4];
          print_id_pelanggan = currentTrx.nomorTujuan || '-';
          print_nominal = productNameArray.length >= 3 ? productNameArray[2] : '-';
        } else if (currentTrx.server?.kode === 'DIGI' && myArray.length >= 4) {
          const getToken = myArray[0].split(':');
          print_tanggal = currentTrx.updatedAt.toISOString().split('T')[0];
          print_waktu = currentTrx.updatedAt.toTimeString().split(' ')[0];
          print_token = getToken[0].trim();
          print_nama = myArray[1].trim();
          print_tarif_daya = myArray[2] + '/' + myArray[3];
          print_jml_kwh = '-';
          print_id_pelanggan = currentTrx.nomorTujuan || '-';
          print_nominal = productNameArray.length >= 3 ? productNameArray[2] : '-';
        }
      }

      // format Rp
      const formatRp = (num: number) => {
        return 'Rp ' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      };

      return {
        error: false,
        error_msg: 'Detail Transaksi Berhasil Ditemukan',
        data: {
          status: currentTrx.status?.toUpperCase() || 'PROSES',
          type: currentTrx.type || 'prabayar',
          productName: `${currentTrx.produk?.kode || ''} ${currentTrx.produk?.name || ''}`.trim(),
          print_status: !!print_status,
          print_tanggal,
          print_waktu,
          kodeAgen: currentTrx.kodeAgen,
          laba: currentTrx.laba,
          fee_agen: currentTrx.fee_agen,
          serial_number: currentTrx.serial_number,
          trx_id: currentTrx.trx_id,
          createdAt: currentTrx.createdAt,
          updatedAt: currentTrx.updatedAt.toISOString().replace(/T/, ' ').replace(/\..+/, ''),
          print_tarif_daya,
          print_id_pelanggan,
          print_nama,
          print_nominal,
          print_jml_kwh,
          print_token,
          dateTransaction: currentTrx.updatedAt.toISOString().replace(/T/, ' ').replace(/\..+/, ''),
          nomorTujuan: currentTrx.nomorTujuan || '',
          price: formatRp(currentTrx.selling_price || 0),
          selling_price_raw: currentTrx.selling_price || 0,
          serialNumber: currentTrx.serial_number || '-',
          message: !currentTrx.ket || currentTrx.ket === '' ? '-' : currentTrx.ket,
        },
      };

    } catch (error) {
      this.logger.error('Error getDetailTransaksiPrabayar:', error);
      return {
        error: true,
        error_msg: 'Terjadi kesalahan saat mengambil detail transaksi',
      };
    }
  }
}
