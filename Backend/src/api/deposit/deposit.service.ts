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
}
