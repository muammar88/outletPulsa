import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class DepositService {
  constructor(private readonly prisma: PrismaService) {}

  async getDepositInfo(memberId: number) {
    try {
      // Dapatkan tiket deposit yang masih proses
      const pendingTickets = await this.prisma.requestDeposit.findMany({
        where: {
          riwayatTransaksi: {
            memberId: memberId,
          },
          status: 'proses',
        },
        select: {
          id: true,
          kode: true,
          nominal: true,
          nominalTambahan: true,
          waktuRequest: true,
        },
      });

      const list_tiket = pendingTickets.map((t) => ({
        id: t.id.toString(),
        kode: t.kode || '-',
        total: ((t.nominal || 0) + (t.nominalTambahan || 0)).toString(),
        waktuRequest: t.waktuRequest?.toISOString() || '',
      }));

      // Dapatkan bank transfer outlet
      const banks = await this.prisma.bankTransferOutlet.findMany({
        include: { bank: true },
      });

      const list_select_bank = banks.map(
        (b) => `${b.id}:${b.bank?.nama || 'Bank'}`
      );

      const list_bank = {};
      banks.forEach((b) => {
        list_bank[b.id] = {
          nama: b.bank?.nama || '',
          accountName: b.accountName || '',
          accountNumber: b.accountNumber || '',
          image: b.bank?.image || '',
        };
      });

      return {
        error: false,
        error_msg: '',
        list_tiket,
        list_bank,
        list_select_bank,
        pesan:
          'Silakan transfer sesuai dengan nominal tiket deposit (termasuk 3 digit kode unik) agar saldo otomatis bertambah.',
      };
    } catch (error) {
      return {
        error: true,
        error_msg: 'Gagal mengambil informasi deposit',
        data: {},
      };
    }
  }

  async getDepositInfoKonfirmasi(memberId: number) {
    try {
      const deposit = await this.prisma.requestDeposit.findFirst({
        where: {
          riwayatTransaksi: {
            memberId: memberId,
          },
          status: 'proses',
        },
        orderBy: {
          id: 'desc',
        },
        include: {
          bankTransferOutlet: {
            include: {
              bank: true,
            },
          },
        },
      });

      if (!deposit) {
        return {
          error: false,
          message: 'Success',
          data: {},
        };
      }

      const totalNominal = (deposit.nominal || 0) + (deposit.nominalTambahan || 0);

      return {
        error: false,
        message: 'Success',
        data: {
          list: {
            kode: deposit.kode || '-',
            nominal: totalNominal.toString(),
            bank_tujuan_transfer: deposit.bankTransferOutlet?.bank?.nama || '-',
            nomor_rekening_akun: deposit.bankTransferOutlet?.accountNumber || '-',
            nama_akun: deposit.bankTransferOutlet?.accountName || '-',
            status_deposit: deposit.status || '-',
            status_kirim: deposit.statusKirim || '-',
            alasan_penolakan: deposit.alasanPenolakan || '-',
            waktu_kirim: deposit.waktuKirim ? deposit.waktuKirim.toISOString() : '-',
          },
        },
      };
    } catch (error) {
      return {
        error: true,
        error_msg: 'Gagal mengambil informasi konfirmasi deposit',
        data: {},
      };
    }
  }
}
