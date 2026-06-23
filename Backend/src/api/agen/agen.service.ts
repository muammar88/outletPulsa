import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class AgenService {
  constructor(private readonly prisma: PrismaService) {}

  async getResellers(kodeAgen: string) {
    if (!kodeAgen) {
      return {
        error: true,
        error_msg: 'Kode agen tidak valid',
        list: {}
      };
    }

    const resellers = await this.prisma.member.findMany({
      where: { kode_agen: kodeAgen },
      select: {
        id: true,
        kode: true,
        fullname: true,
        whatsappnumber: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    const listMap = {};
    resellers.forEach((item, index) => {
      listMap[index.toString()] = item;
    });

    return {
      error: false,
      error_msg: 'Daftar reseller berhasil diambil',
      data: {
        list: listMap
      }
    };
  }

  async getStatistik(kodeAgen: string, memberId: number) {
    if (!kodeAgen) {
      return { error: true, error_msg: 'Kode agen tidak valid', data: {} };
    }

    // 1. Get member current saldo
    const member = await this.prisma.member.findUnique({ where: { id: memberId } });
    const saldoAgenSaatIni = member?.saldo || 0;

    // 2. Total reseller aktif
    const totalResellerAktif = await this.prisma.member.count({
      where: { kode_agen: kodeAgen }
    });

    // 3. Transactions where kodeAgen = agen.kode and status = 'sukses'
    const trxPrabayar = await this.prisma.transaction.findMany({
      where: { kodeAgen: kodeAgen, status: 'sukses' },
      select: { selling_price: true, fee_agen: true, status_fee_agen: true, createdAt: true }
    });

    const trxCetak = await this.prisma.transactionPascabayar.findMany({
      where: { kodeAgen: kodeAgen, status: 'sukses' },
      select: { total: true, fee_agen: true, status_fee_agen: true, createdAt: true }
    });

    // 4. Calculations
    let totalTransaksiSemuaReseller = trxPrabayar.length + trxCetak.length;
    let totalTransaksiBulanIni = 0;
    
    let totalOmzetJaringan = 0;
    let totalFeeAgenAkumulasi = 0;
    let feeUnpaid = 0;
    let feePaid = 0;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    for (const t of trxPrabayar) {
      if (t.createdAt >= startOfMonth) {
        totalTransaksiBulanIni++;
      }
      totalOmzetJaringan += (t.selling_price || 0);
      const fee = t.fee_agen || 0;
      totalFeeAgenAkumulasi += fee;
      if (t.status_fee_agen === 'unpaid') feeUnpaid += fee;
      if (t.status_fee_agen === 'paid') feePaid += fee;
    }

    for (const t of trxCetak) {
      if (t.createdAt >= startOfMonth) {
        totalTransaksiBulanIni++;
      }
      totalOmzetJaringan += (t.total || 0);
      const fee = t.fee_agen || 0;
      totalFeeAgenAkumulasi += fee;
      if (t.status_fee_agen === 'unpaid') feeUnpaid += fee;
      if (t.status_fee_agen === 'paid') feePaid += fee;
    }

    const saldoKeagenanBelumDiklaim = feeUnpaid;

    return {
      error: false,
      error_msg: 'Berhasil',
      data: {
        list: {
          total_reseller_aktif: totalResellerAktif,
          total_transaksi_bulan_ini: totalTransaksiBulanIni,
          total_transaksi_semua_reseller: totalTransaksiSemuaReseller,
          total_omzet_jaringan: totalOmzetJaringan,
          total_fee_agen_akumulasi: totalFeeAgenAkumulasi,
          fee_unpaid: feeUnpaid,
          fee_paid: feePaid,
          saldo_keagenan_belum_diklaim: saldoKeagenanBelumDiklaim,
          saldo_agen_saat_ini: saldoAgenSaatIni
        }
      }
    };
  }

  async klaimFee(kodeAgen: string, memberId: number) {
    if (!kodeAgen) {
      return { error: true, error_msg: 'Kode agen tidak valid', data: {} };
    }

    // Ambil data transaksi unpaid
    const trxPrabayar = await this.prisma.transaction.findMany({
      where: { kodeAgen: kodeAgen, status: 'sukses', status_fee_agen: 'unpaid' },
      select: { id: true, fee_agen: true }
    });

    const trxCetak = await this.prisma.transactionPascabayar.findMany({
      where: { kodeAgen: kodeAgen, status: 'sukses', status_fee_agen: 'unpaid' },
      select: { id: true, fee_agen: true }
    });

    let totalFee = 0;
    const prabayarIds: number[] = [];
    const cetakIds: number[] = [];

    for (const t of trxPrabayar) {
      totalFee += (t.fee_agen || 0);
      prabayarIds.push(t.id);
    }
    for (const t of trxCetak) {
      totalFee += (t.fee_agen || 0);
      cetakIds.push(t.id);
    }

    if (totalFee <= 0) {
      return { error: true, error_msg: 'Tidak ada saldo keagenan yang bisa diklaim', data: {} };
    }

    try {
      // Ambil saldo member sebelum klaim (snapshot sebelum transaction dimulai)
      const memberBefore = await this.prisma.member.findUnique({
        where: { id: memberId },
        select: { id: true, saldo: true, kode: true }
      });
      const saldoSebelumKlaim = memberBefore?.saldo ?? 0;
      const saldoSetelahKlaim = saldoSebelumKlaim + totalFee;

      // Kode unik untuk riwayat klaim
      const kodeKlaim = `KLAIM-FEE-${Date.now()}`;

      await this.prisma.$transaction(async (tx) => {
        // 1. Update saldo member
        await tx.member.update({
          where: { id: memberId },
          data: { saldo: { increment: totalFee } }
        });

        // 2. Update status fee transaksi prabayar → paid (tidak bisa diklaim ulang)
        if (prabayarIds.length > 0) {
          await tx.transaction.updateMany({
            where: { id: { in: prabayarIds } },
            data: { status_fee_agen: 'paid' }
          });
        }

        // 3. Update status fee transaksi pascabayar → paid (tidak bisa diklaim ulang)
        if (cetakIds.length > 0) {
          await tx.transactionPascabayar.updateMany({
            where: { id: { in: cetakIds } },
            data: { status_fee_agen: 'paid' }
          });
        }

        // 4. Buat RiwayatTransaksi sebagai anchor transaksi member
        const riwayat = await tx.riwayatTransaksi.create({
          data: {
            memberId: memberId,
            tipeTransaksi: 'terima_saldo',
          }
        });

        // 5. Catat ke TerimaSaldo (riwayat mutasi saldo masuk)
        await tx.terimaSaldo.create({
          data: {
            kode: kodeKlaim,
            riwayatTransaksiId: riwayat.id,
            biaya: totalFee
          }
        });

        // 6. Catat ke RiwayatSaldo (histori saldo lengkap dengan saldo sebelum/sesudah)
        await tx.riwayatSaldo.create({
          data: {
            kode: kodeKlaim,
            member_id: memberId,
            nominal: totalFee,
            saldo_sebelumnya: saldoSebelumKlaim,
            saldo_setelahnya: saldoSetelahKlaim,
            status: 'pencairan_fee_agen',
            ket: `Pencairan fee agen dari ${prabayarIds.length + cetakIds.length} transaksi reseller`,
            riwayat_transaksi_id: riwayat.id,
          }
        });

        // 7. Catat ke PaymentFeeAgenHistory dengan kolom saldo sebelum & sesudah klaim
        await tx.paymentFeeAgenHistory.create({
          data: {
            memberId: memberId,
            kode: kodeKlaim,
            totalPayment: totalFee,
            paymentType: 'withdraw',
            transaksiPrabayar: prabayarIds.length,
            transaksiPascabayar: cetakIds.length,
            saldo_sebelum_klaim: saldoSebelumKlaim,
            saldo_setelah_klaim: saldoSetelahKlaim,
          }
        });
      });

      return {
        error: false,
        error_msg: 'Klaim saldo keagenan berhasil sebesar Rp ' + totalFee.toLocaleString('id-ID'),
        data: {
          list: {
            total_klaim: totalFee,
            saldo_sebelum_klaim: saldoSebelumKlaim,
            saldo_setelah_klaim: saldoSetelahKlaim,
            jumlah_transaksi_prabayar: prabayarIds.length,
            jumlah_transaksi_pascabayar: cetakIds.length,
          }
        }
      };
    } catch (e) {
      console.error('Error klaim fee agen:', e);
      return { error: true, error_msg: 'Terjadi kesalahan saat klaim saldo, silakan coba lagi', data: {} };
    }
  }

  async getTransaksiReseller(kodeAgen: string) {
    if (!kodeAgen) {
      return { error: true, error_msg: 'Akses ditolak', list: [] };
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    try {
      // Get from Transaction (Prabayar)
      const trxPrabayar = await this.prisma.transaction.findMany({
        where: {
          kodeAgen: kodeAgen,
          status: 'sukses',
          createdAt: { gte: startOfMonth }
        },
        include: {
          riwayatTransaksi: {
            include: { member: { select: { fullname: true } } }
          },
          produk: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Get from TransactionPascabayar (Pascabayar)
      const trxCetak = await this.prisma.transactionPascabayar.findMany({
        where: {
          kodeAgen: kodeAgen,
          status: 'sukses',
          createdAt: { gte: startOfMonth }
        },
        include: {
          riwayatTransaksi: {
            include: { member: { select: { fullname: true } } }
          },
          produkPascabayar: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
      });

      const combinedList: any[] = [];
      
      for (const t of trxPrabayar) {
        combinedList.push({
          id: t.id,
          jenis: 'prabayar',
          reseller_name: t.riwayatTransaksi?.member?.fullname || 'Reseller',
          produk_name: t.produk?.name || 'Produk Prabayar',
          nominal: t.selling_price || 0,
          fee_agen: t.fee_agen || 0,
          status: t.status,
          tanggal: t.createdAt
        });
      }

      for (const t of trxCetak) {
        combinedList.push({
          id: t.id,
          jenis: 'pascabayar',
          reseller_name: t.riwayatTransaksi?.member?.fullname || 'Reseller',
          produk_name: t.produkPascabayar?.name || 'Produk Pascabayar',
          nominal: t.nominal || t.totalNominal || 0,
          fee_agen: t.fee_agen || 0,
          status: t.status,
          tanggal: t.createdAt
        });
      }

      combinedList.sort((a, b) => b.tanggal.getTime() - a.tanggal.getTime());

      const listMap = {};
      combinedList.forEach((item, index) => {
        listMap[index.toString()] = item;
      });

      return {
        error: false,
        error_msg: 'Berhasil',
        data: {
          list: listMap
        }
      };
    } catch (e) {
      console.error('Error fetching reseller transactions:', e);
      return { error: true, error_msg: 'Gagal mengambil data', list: [] };
    }
  }
}
