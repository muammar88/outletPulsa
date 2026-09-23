import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateTransaksiPrabayarDto } from './dto/create-transaksi-prabayar.dto';
import { IakService } from '../../providers/iak.service';
import { DigiflazzService } from '../../providers/digiflazz.service';
import { TripayService } from '../../providers/tripay.service';
import { PengumumanService } from '../../pengumuman/pengumuman.service';
import { TransaksiFinalizerService } from './transaksi-finalizer.service';

@Injectable()
export class TransaksiService {
  private readonly logger = new Logger(TransaksiService.name);
  private idempotencyInFlight = new Map<string, Promise<any>>();

  constructor(
    private prisma: PrismaService,
    private iakService: IakService,
    private digiflazzService: DigiflazzService,
    private tripayService: TripayService,
    private pengumumanService: PengumumanService,
    private transaksiFinalizer: TransaksiFinalizerService,
  ) {}

  private async withTimeout<T>(promise: Promise<T>, timeoutMs = 15000): Promise<T> {
    let timer: NodeJS.Timeout;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('PROVIDER_TIMEOUT')), timeoutMs);
    });
    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      clearTimeout(timer!);
    }
  }

  private parseSnapshot(ket?: string | null): any {
    if (!ket) return null;
    const match = ket.match(/\[SNAPSHOT:(\{.*?\})\]/);
    if (match) {
      try {
        return JSON.parse(match[1]);
      } catch {
        return null;
      }
    }
    return null;
  }

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
          ket: trx.ket && !trx.ket.startsWith('[SNAPSHOT:') ? trx.ket : '',
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
    if (dto.idempotency_key) {
      const inFlightKey = `${memberId}:${dto.idempotency_key}`;
      const existingInFlight = this.idempotencyInFlight.get(inFlightKey);
      if (existingInFlight) {
        return await existingInFlight;
      }
      const execution = this.processCreateTransaksiPrabayar(memberId, dto);
      this.idempotencyInFlight.set(inFlightKey, execution);
      try {
        return await execution;
      } finally {
        this.idempotencyInFlight.delete(inFlightKey);
      }
    }
    return this.processCreateTransaksiPrabayar(memberId, dto);
  }

  private async processCreateTransaksiPrabayar(memberId: number, dto: CreateTransaksiPrabayarDto) {
    try {
      // Step 0: Check idempotency in database
      if (dto.idempotency_key) {
        const existingTrx = await this.prisma.transaction.findFirst({
          where: {
            riwayatTransaksi: { memberId },
            ket: { contains: `"idemp":"${dto.idempotency_key}"` },
          },
          include: { produk: true },
        });

        if (existingTrx) {
          const isSameTarget = existingTrx.nomorTujuan === dto.nomor_tujuan;
          const isSameProduct = existingTrx.produk?.kode === dto.kode_produk;
          if (!isSameTarget || !isSameProduct) {
            return {
              error: true,
              error_msg: 'Idempotency key sudah digunakan untuk transaksi berbeda',
            };
          }
          return {
            error: false,
            error_msg: 'Proses Pembelian Berhasil Dilakukan',
            kodeTransaksi: existingTrx.kode,
          };
        }
      }

      // 1. Dapatkan informasi produk dan server
      const produk = await this.prisma.produk.findFirst({
        where: { kode: dto.kode_produk, status: 'active' }, 
        include: { server: true }
      });

      if (!produk) {
        return { error: true, error_msg: 'Produk tidak ditemukan atau tidak aktif' };
      }

      // === FIND MAPPING ===
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

      // 2. Cek Member
      const member = await this.prisma.member.findUnique({
        where: { id: memberId }
      });

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

      // 3. Pengecekan saldo (Optimistic Check)
      const currentSaldo = member.saldo ?? 0;
      if (currentSaldo < totalBayar) {
        return { error: true, error_msg: 'Saldo member tidak mencukupi' };
      }

      const kodeTransaksi = `TRX${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;

      const snapshotData = {
        idemp: dto.idempotency_key || null,
        sku: providerProductCode,
        server: produk.server?.kode,
        serverId: produk.serverId,
        nomorTujuan: dto.nomor_tujuan,
        kodeProduk: dto.kode_produk,
        createdAt: new Date().toISOString(),
      };
      const snapshotTag = `[SNAPSHOT:${JSON.stringify(snapshotData)}]`;

      // 4. Proses Transaksi Database (Atomic / Transaction)
      let newTrxId: number = 0;
      let newSaldo: number = 0;
      try {
        await this.prisma.$transaction(async (tx) => {
          // Potong saldo dengan Atomic Decrement
          const updateMember = await tx.member.update({
            where: { id: memberId },
            data: { saldo: { decrement: totalBayar } }
          });

          // Pengecekan setelah potong saldo
          const updatedSaldo = updateMember.saldo ?? 0;
          if (updatedSaldo < 0) {
            throw new Error('InsufficientBalance');
          }

          newSaldo = updatedSaldo;

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
            ket: snapshotTag,
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

      // 5. Hit API Provider dengan Timeout 15s
      this.logger.log(`Melakukan top-up ke server ${produk.server?.kode} untuk transaksi ${kodeTransaksi}`);
      let providerResponse: any;

      try {
        if (produk.server?.kode === 'IAK') {
          providerResponse = await this.withTimeout(this.iakService.topUp(kodeTransaksi, dto.nomor_tujuan, providerProductCode), 15000);
        } else if (produk.server?.kode === 'TRI') {
          const isPln = dto.kode_produk.toUpperCase().includes('PLN') || providerProductCode.toUpperCase().includes('PLN');
          providerResponse = await this.withTimeout(this.tripayService.topUp(kodeTransaksi, dto.nomor_tujuan, providerProductCode, isPln), 15000);
        } else if (produk.server?.kode === 'DIGI') {
          providerResponse = await this.withTimeout(this.digiflazzService.topUp(kodeTransaksi, dto.nomor_tujuan, providerProductCode), 15000);

          // Penanganan error "Seller sedang mengalami gangguan"
          if (
            providerResponse.status_success === false && 
            providerResponse.rc === '62' && 
            providerResponse.raw_response?.data?.message?.includes('Seller sedang mengalami gangguan')
          ) {
            const failedSku = providerResponse.raw_response?.data?.buyer_sku_code;
            if (failedSku) {
              this.logger.warn(`Seller Digiflazz ${failedSku} dinonaktifkan karena gangguan.`);
              await this.prisma.digiflazzSellerProduct.updateMany({
                where: { buyerSkuKode: failedSku },
                data: { sellerProductStatus: false }
              });
              
              const digiflazzProduct = await this.prisma.digiflazzProduct.findFirst({
                where: { produkId: produk.id }
              });
              
              if (digiflazzProduct) {
                const nextCheapestSeller = await this.prisma.digiflazzSellerProduct.findFirst({
                  where: {
                    productDigiflazzId: digiflazzProduct.id,
                    sellerProductStatus: true,
                    digiflazzSeller: { status: 'unbanned' }
                  },
                  orderBy: { price: 'asc' }
                });
                
                if (nextCheapestSeller) {
                  await this.prisma.digiflazzProduct.update({
                    where: { id: digiflazzProduct.id },
                    data: {
                      selectedSellerBuyerSkuKode: nextCheapestSeller.buyerSkuKode,
                      selectedSellerPrice: nextCheapestSeller.price,
                      status: 'active'
                    }
                  });
                } else {
                  await this.prisma.digiflazzProduct.update({
                    where: { id: digiflazzProduct.id },
                    data: { status: 'inactive' }
                  });
                }
              }
            }

            const masterProduk = await this.prisma.produk.findUnique({
              where: { id: produk.id },
              include: {
                iakPrabayarProduks: true,
                tripayPrabayarProduks: true,
                digiflazzProducts: true,
              }
            });
            
            const activeServersData = await this.prisma.server.findMany({ where: { status: 'active' } });
            const iakServer = activeServersData.find(s => s.kode === 'IAK');
            const triServer = activeServersData.find(s => s.kode === 'TRI');
            const digiServer = activeServersData.find(s => s.kode === 'DIGI');
            
            const alternatives: any[] = [];
            if (masterProduk) {
              if (iakServer && masterProduk.iakPrabayarProduks.length > 0) {
                const iak = masterProduk.iakPrabayarProduks[0];
                if (iak.status === 'active' && iak.price) alternatives.push({ serverId: iakServer.id, serverCode: 'IAK', price: iak.price, providerCode: iak.kode });
              }
              if (triServer && masterProduk.tripayPrabayarProduks.length > 0) {
                const tri = masterProduk.tripayPrabayarProduks[0];
                if (tri.status?.toLowerCase() === 'active' && tri.price) alternatives.push({ serverId: triServer.id, serverCode: 'TRI', price: tri.price, providerCode: tri.kode });
              }
              if (digiServer && masterProduk.digiflazzProducts.length > 0) {
                const digi = masterProduk.digiflazzProducts[0];
                if (digi.status === 'active' && digi.selectedSellerPrice) alternatives.push({ serverId: digiServer.id, serverCode: 'DIGI', price: digi.selectedSellerPrice, providerCode: digi.selectedSellerBuyerSkuKode });
              }
            }

            alternatives.sort((a, b) => a.price - b.price);

            if (alternatives.length > 0) {
              const selected = alternatives[0];
              this.logger.log(`Mengalihkan transaksi ${kodeTransaksi} ke server alternatif ${selected.serverCode} dengan kode ${selected.providerCode} (Harga: ${selected.price})`);
              
              const updatedSnapshot = {
                ...snapshotData,
                failover: {
                  from: 'DIGI',
                  to: selected.serverCode,
                  sku: selected.providerCode,
                  price: selected.price,
                },
              };

              await this.prisma.transaction.update({
                where: { id: newTrxId },
                data: {
                  purchase_price: selected.price,
                  serverId: selected.serverId,
                  ket: `[SNAPSHOT:${JSON.stringify(updatedSnapshot)}]`,
                }
              });

              await this.prisma.produk.update({
                where: { id: produk.id },
                data: {
                  serverId: selected.serverId,
                  purchase_price: selected.price
                }
              });

              if (selected.serverCode === 'IAK') {
                providerResponse = await this.withTimeout(this.iakService.topUp(kodeTransaksi, dto.nomor_tujuan, selected.providerCode), 15000);
              } else if (selected.serverCode === 'TRI') {
                const isPln = dto.kode_produk.toUpperCase().includes('PLN') || selected.providerCode.toUpperCase().includes('PLN');
                providerResponse = await this.withTimeout(this.tripayService.topUp(kodeTransaksi, dto.nomor_tujuan, selected.providerCode, isPln), 15000);
              } else if (selected.serverCode === 'DIGI') {
                providerResponse = await this.withTimeout(this.digiflazzService.topUp(kodeTransaksi, dto.nomor_tujuan, selected.providerCode), 15000);
              }
            } else {
              this.logger.warn(`Tidak ada produk/server alternatif untuk ${produk.kode}. Transaksi dilanjutkan dengan respon error asli.`);
              await this.prisma.produk.update({
                where: { id: produk.id },
                data: { status: 'inactive', serverId: null }
              });
            }
          }
        } else {
          providerResponse = { status_success: false, trx_id: '' };
        }
      } catch (err: any) {
        this.logger.error(`Error/timeout saat memanggil provider untuk ${kodeTransaksi}:`, err);
        providerResponse = { status_success: false, isTimeout: true, trx_id: '', message: err?.message };
      }

      // Safe trx_id handling (protect against non-numeric or overflow values)
      const rawTrxId = providerResponse?.trx_id;
      let safeTrxId: number | null = null;
      if (rawTrxId !== undefined && rawTrxId !== null && rawTrxId !== '') {
        const num = Number(rawTrxId);
        if (Number.isSafeInteger(num) && num > 0 && num <= 2147483647) {
          safeTrxId = num;
        }
      }
      const snValue = providerResponse?.sn ? String(providerResponse.sn) : (!safeTrxId && rawTrxId ? String(rawTrxId) : undefined);

      // Direct Success Check
      const isDirectSuccess = 
        providerResponse?.raw_response?.data?.status === '1' || 
        providerResponse?.raw_response?.data?.status === 1 ||
        providerResponse?.rc === '00' ||
        providerResponse?.raw_response?.data?.status?.toLowerCase?.() === 'sukses';

      // Definitive Failure Check (not timeout, not pending rc 03 / status 0)
      const isDefinitiveFailure =
        !providerResponse?.isTimeout &&
        (
          providerResponse?.raw_response?.data?.status === '2' ||
          providerResponse?.raw_response?.data?.status === 2 ||
          (providerResponse?.rc && providerResponse.rc !== '00' && providerResponse.rc !== '03') ||
          (providerResponse?.raw_response?.success === false && providerResponse?.raw_response?.data?.status === 2)
        );

      if (isDirectSuccess) {
        await this.transaksiFinalizer.finalizeTransaction({
          transactionId: newTrxId,
          targetStatus: 'sukses',
          sn: snValue,
          actualPurchasePrice: providerResponse?.price ? Number(providerResponse.price) : undefined,
          source: 'PROVIDER_DIRECT_SUCCESS',
        });
      } else if (isDefinitiveFailure) {
        const failMessage = providerResponse?.raw_response?.data?.message || providerResponse?.raw_response?.message || 'Transaksi ditolak oleh provider';
        await this.transaksiFinalizer.finalizeTransaction({
          transactionId: newTrxId,
          targetStatus: 'gagal',
          ket: failMessage,
          source: 'PROVIDER_DIRECT_FAILED',
        });
      } else {
        // Pending or Timeout -> remain 'proses'
        if (safeTrxId || snValue) {
          await this.prisma.transaction.update({
            where: { id: newTrxId },
            data: {
              trx_id: safeTrxId,
              serial_number: snValue,
            },
          });
        }
      }

      return {
        error: false,
        error_msg: 'Proses Pembelian Berhasil Dilakukan',
        kodeTransaksi: kodeTransaksi,
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

      const snapshot = this.parseSnapshot(trx.ket);
      const snapshotSku = snapshot?.sku || '';

      // --- Realtime status check ---
      if (trx.status === 'proses') {
        let checkRes: { status: string; sn: string; raw: any } | null = null;
        
        if (trx.server?.kode === 'IAK') {
          checkRes = await this.iakService.checkStatus(trx.kode || '');
        } else if (trx.server?.kode === 'TRI') {
          checkRes = await this.tripayService.checkStatus(trx.trx_id?.toString() || '', trx.kode || '');
        } else if (trx.server?.kode === 'DIGI') {
          let providerProductCode = snapshotSku;
          if (!providerProductCode) {
            const digiMapping = await this.prisma.digiflazzProduct.findFirst({ where: { produkId: trx.produkId } });
            if (digiMapping) providerProductCode = digiMapping.selectedSellerBuyerSkuKode || '';
          }
          checkRes = await this.digiflazzService.checkStatus(trx.kode || '', trx.nomorTujuan || '', providerProductCode);
        }

        if (checkRes && checkRes.status !== 'proses') {
          let realPurchasePrice = trx.purchase_price;

          if (checkRes.status === 'sukses') {
            const rawData = checkRes.raw?.data;
            if (rawData && rawData.price !== undefined) {
              realPurchasePrice = Number(rawData.price);
            }
          }

          const finalizeRes = await this.transaksiFinalizer.finalizeTransaction({
            transactionId: trx.id,
            targetStatus: checkRes.status as 'sukses' | 'gagal',
            sn: checkRes.sn,
            actualPurchasePrice: realPurchasePrice ?? undefined,
            source: 'DETAIL_CHECK',
          });

          if (finalizeRes.transaction) {
            trx = finalizeRes.transaction;
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

      if (currentTrx.ket && print_status && !currentTrx.ket.startsWith('[SNAPSHOT:')) {
        const text = currentTrx.ket;
        const myArray = text.split('/');
        const productNameArray = currentTrx.produk?.name?.split(' ') || [];
        
        if (currentTrx.server?.kode === 'IAK' && myArray.length >= 5) {
          print_tanggal = currentTrx.updatedAt.toISOString().split('T')[0];
          print_waktu = currentTrx.updatedAt.toTimeString().split(' ')[0];
          print_token = myArray[0].trim();
          print_nama = myArray[1].trim();
          print_tarif_daya = myArray[2] + '/' + myArray[3];
          print_jml_kwh = myArray[4];
          print_id_pelanggan = currentTrx.nomorTujuan || '-';
          print_nominal = productNameArray.length >= 3 ? productNameArray[2] : '-';
        } else if (currentTrx.server?.kode === 'TRI' && myArray.length >= 5) {
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

      const userDisplayMessage = !currentTrx.ket || currentTrx.ket === '' || currentTrx.ket.startsWith('[SNAPSHOT:')
        ? (currentTrx.status === 'proses' ? 'Sedang diproses' : '-')
        : currentTrx.ket;

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
          message: userDisplayMessage,
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
