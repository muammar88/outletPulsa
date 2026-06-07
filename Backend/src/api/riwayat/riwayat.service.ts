import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class RiwayatService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Mengambil riwayat deposit/saldo member berdasarkan kode member.
   */
  async getRiwayatDeposit(kode: string, page: number = 1, limit: number = 20) {

    console.log("-------");
    console.log("kode :",kode);
    console.log("-------");

    const member = await this.prisma.member.findFirst({
      where: { kode },
      select: { id: true },
    });

    if (!member) {
      // Jika member tidak ada, kembalikan list kosong dengan format konsisten
      return {
        error: false,
        message: 'Data riwayat tidak ditemukan (Member invalid)',
        data : {
          list: []
        }
      };
    }

    console.log("-------1");
    console.log("member :",member);
    console.log("-------1");

    const skip = (page - 1) * limit;

    const [total, riwayatTransaksi] = await Promise.all([
      this.prisma.riwayatTransaksi.count({
        where: { tipeTransaksi : 'deposit', memberId: member.id },
      }),
      this.prisma.riwayatTransaksi.findMany({
        where: { tipeTransaksi : 'deposit', memberId: member.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { requestDeposits: true },
      }),
    ]);

    const mappedList = riwayatTransaksi.map((riwayat) => {
      const deposit = riwayat.requestDeposits?.[0];
      const nominalVal = deposit ? ((deposit.nominal || 0) + (deposit.nominalTambahan || 0)) : 0;
      
      return {
        // Field spesifik yang dibaca oleh aplikasi Mobile (Sub_riwayat_deposit)
        id: deposit?.id || riwayat.id,
        kode: deposit?.kode || riwayat.id.toString(),
        waktuRequest: deposit?.waktuRequest?.toISOString() || riwayat.createdAt.toISOString(),
        nominal: nominalVal.toString(), // Di Mobile diminta dalam bentuk String (saldo: item['nominal'])
        status: deposit?.status || 'proses',

        // Field tambahan sesuai requirement awal (jaga-jaga)
        tanggal_transaksi: riwayat.createdAt,
        jenis_transaksi: riwayat.tipeTransaksi,
        keterangan: deposit?.alasanPenolakan ? `Deposit ditolak: ${deposit.alasanPenolakan}` : `Deposit ${deposit?.status || 'proses'}`,
        saldo_sebelum: 0,
        saldo_sesudah: 0,
        status_transaksi: deposit?.status || 'proses',
      };
    });

    return {
      error: false,
      message: 'Sukses',
      list: mappedList,
      pagination: {
        page,
        limit,
        total_data: total,
        total_page: Math.ceil(total / limit),
      },
    };
  }

  async getDetailDeposit(memberKode: string, depositId: number) {
    const member = await this.prisma.member.findFirst({
      where: { kode: memberKode },
    });
    
    if (!member) {
      return { error: true, message: 'Member tidak valid', data: null };
    }

    const deposit = await this.prisma.requestDeposit.findFirst({
      where: {
        id: depositId,
        riwayatTransaksi: {
          memberId: member.id,
        }
      },
      include: {
        bankTransferOutlet: {
          include: {
            bank: true,
          }
        },
      },
    });

    if (!deposit) {
      return { error: true, message: 'Detail deposit tidak ditemukan', data: null };
    }

    const nominalVal = (deposit.nominal || 0) + (deposit.nominalTambahan || 0);

    return {
      error: false,
      message: 'Sukses',
      data: {
        list: {
          kode: deposit.kode,
          nominal: nominalVal.toString(),
          bank_tujuan_transfer: deposit.bankTransferOutlet?.bank?.nama || '-',
          nomor_rekening_akun: deposit.bankTransferOutlet?.accountNumber || '-',
          nama_akun: deposit.bankTransferOutlet?.accountName || '-',
          status_deposit: deposit.status,
          status_kirim: deposit.statusKirim || 'MENUNGGU',
          alasan_penolakan: deposit.alasanPenolakan || '-',
          waktu_kirim: deposit.waktuRequest?.toISOString() || '',
        }
      }
    };
  }
}
