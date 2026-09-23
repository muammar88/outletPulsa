import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class RiwayatService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Mengambil riwayat deposit/saldo member berdasarkan kode member.
   */
  async getRiwayatDeposit(kode: string, page: number = 1, limit: number = 20, search?: string) {

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
    
    const whereCondition: any = {
      tipeTransaksi : 'deposit',
      memberId: member.id,
    };
    if (search) {
      whereCondition.requestDeposits = {
        some: {
          kode: { contains: search }
        }
      };
    }

    const [total, riwayatTransaksi] = await Promise.all([
      this.prisma.riwayatTransaksi.count({
        where: whereCondition,
      }),
      this.prisma.riwayatTransaksi.findMany({
        where: whereCondition,
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

    let deposit = await this.prisma.requestDeposit.findFirst({
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
        paymentGatewayTransaction: true,
      },
    });

    if (!deposit) {
      // Check if it's a manual deposit (using riwayatTransaksi ID)
      const riwayatSaldo = await this.prisma.riwayatSaldo.findFirst({
        where: {
          riwayat_transaksi_id: depositId,
          member_id: member.id,
          status: 'deposit',
        }
      });
      
      if (!riwayatSaldo) {
        return { error: true, message: 'Detail deposit tidak ditemukan', data: null };
      }

      return {
        error: false,
        message: 'Sukses',
        data: {
          list: {
            kode: riwayatSaldo.kode,
            nominal: riwayatSaldo.nominal.toString(),
            bank_tujuan_transfer: '-',
            nomor_rekening_akun: '-',
            nama_akun: '-',
            status_deposit: riwayatSaldo.status,
            status_kirim: 'SUDAH_KIRIM',
            alasan_penolakan: '-',
            waktu_kirim: riwayatSaldo.created_at?.toISOString() || '',
            payment_gateway: null,
          }
        }
      };
    }

    const nominalVal = (deposit.nominal || 0) + (deposit.nominalTambahan || 0);

    let paymentGatewayData: any = null;
    if (deposit.paymentGatewayTransaction) {
      const pg = deposit.paymentGatewayTransaction;
      let meta: any = {};
      try {
        meta = JSON.parse(pg.metadata || '{}');
      } catch {}
      paymentGatewayData = {
        transaction_id: pg.uuid,
        payment_method: pg.payment_method,
        bank_code: pg.bank_code,
        bank_name: pg.bank_name,
        virtual_account: pg.virtual_account,
        amount: Number(pg.amount),
        fee_admin: Number(pg.fee_admin),
        total_amount: Number(pg.total_amount),
        expired_at: pg.expired_at,
        status: pg.status,
        partner_reff: pg.partner_reff,
        qris_text: meta.qris_text,
        imageqris: meta.imageqris,
        checkout_url: meta.checkout_url,
      };
    }

    const bankTujuan = deposit.bankTransferOutlet?.bank?.nama ||
      (deposit.paymentGatewayTransaction ? `${deposit.paymentGatewayTransaction.payment_method}${deposit.paymentGatewayTransaction.bank_name ? ` (${deposit.paymentGatewayTransaction.bank_name})` : ''}` : '-');
    const nomorRek = deposit.bankTransferOutlet?.accountNumber ||
      deposit.paymentGatewayTransaction?.virtual_account || '-';
    const namaAkun = deposit.bankTransferOutlet?.accountName ||
      (deposit.paymentGatewayTransaction ? 'LinkQu Payment' : '-');

    return {
      error: false,
      message: 'Sukses',
      data: {
        list: {
          kode: deposit.kode,
          nominal: nominalVal.toString(),
          bank_tujuan_transfer: bankTujuan,
          nomor_rekening_akun: nomorRek,
          nama_akun: namaAkun,
          status_deposit: deposit.status,
          status_kirim: deposit.statusKirim || 'MENUNGGU',
          alasan_penolakan: deposit.alasanPenolakan || '-',
          waktu_kirim: deposit.waktuRequest?.toISOString() || '',
          payment_gateway: paymentGatewayData,
        }
      }
    };
  }

  async getRiwayatTransferSaldo(memberKode: string, page: number = 1, limit: number = 20, search?: string) {
    const member = await this.prisma.member.findFirst({
      where: { kode: memberKode },
      select: { id: true },
    });

    if (!member) {
      return {
        error: false,
        message: 'Member tidak valid',
        list: []
      };
    }

    const skip = (page - 1) * limit;

    const whereCondition: any = {
      member_id: member.id,
      status: 'transfer_pulsa',
    };
    if (search) {
      whereCondition.ket = { contains: search };
    }

    const [total, riwayatList] = await Promise.all([
      this.prisma.riwayatSaldo.count({
        where: whereCondition,
      }),
      this.prisma.riwayatSaldo.findMany({
        where: whereCondition,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const mappedList = riwayatList.map((riwayat) => {
      // Extract name and phone number from ket: "Transfer saldo ke John Doe (0852...)"
      const regex = /(?:ke|dari)\s+(.*?)\s+\(([^)]+)\)/i;
      const match = riwayat.ket?.match(regex);
      const nama = match ? match[1].trim() : '-';
      const noHp = match ? match[2].trim() : '-';
      
      const isMasuk = riwayat.ket?.toLowerCase().includes('terima');
      
      // Formatting Rp
      const formatter = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      });

      return {
        id: riwayat.id,
        tipeTransaksi: isMasuk ? 'Terima Saldo' : 'Transfer Keluar',
        updatedAt: riwayat.created_at.toISOString().split('T')[0],
        biaya: formatter.format(riwayat.nominal),
        nowhatsapp: noHp,
        namaTarget: nama,
      };
    });

    return {
      error: false,
      message: 'Success',
      list: mappedList,
      pagination: {
        page,
        limit,
        total_data: total,
        total_page: Math.ceil(total / limit),
      },
    };
  }
}
