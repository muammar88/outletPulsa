import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { DepositSaldoDto } from './dto/deposit-saldo.dto';
import { PengumumanService } from '../../pengumuman/pengumuman.service';

@Injectable()
export class DepositService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pengumumanService: PengumumanService
  ) {}

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

  // --- Helper Functions untuk Generate Code ---
  private randomString(length: number, chars: string): string {
    let result = '';
    for (let i = length; i > 0; --i) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }

  private async newCodeBiaya(): Promise<number> {
    let rand = 0;
    let condition = true;

    while (condition) {
      rand = parseInt(this.randomString(3, '123456789'), 10);
      const check = await this.prisma.requestDeposit.findFirst({
        where: { nominalTambahan: rand },
      });
      if (!check) condition = false;
    }
    return rand;
  }

  private async newCodeTransDeposit(): Promise<string> {
    let rand = '';
    let condition = true;

    while (condition) {
      rand = this.randomString(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
      const check = await this.prisma.requestDeposit.findFirst({
        where: { kode: rand },
      });
      if (!check) condition = false;
    }
    return rand;
  }

  // --- Main Logic depositSaldo ---
  async depositSaldo(memberId: number, body: DepositSaldoDto) {
    if (!memberId) {
      return {
        error: true,
        error_msg: 'Id Member Tidak Ditemukan.',
      };
    }

    try {
      // 1. Cek apakah ada deposit proses
      // const total = await this.prisma.requestDeposit.count({
      //   where: {
      //     riwayatTransaksi: {
      //       memberId: memberId,
      //     },
      //     status: 'proses',
      //   },
      // });

      // if (total > 0) {
      //   return {
      //     error: true,
      //     error_msg: 'Masih terdapat request yang belum diproses.',
      //   };
      // }

      // 2. Bersihkan nominal jika berupa string (contoh: "Rp 1.000.000")
      let rawNominal = typeof body.nominal === 'string' ? body.nominal.replace(/[^0-9]/g, '') : body.nominal.toString();
      const nominal = parseInt(rawNominal, 10);
      const bankId = parseInt(body.bank_tujuan_transfer.toString(), 10);

      // 3. Generate random code
      const randCode = await this.newCodeBiaya();
      const kodeTrans = await this.newCodeTransDeposit();
      const myDate = new Date();

      // 4. Transaction database (Prisma)
      await this.prisma.$transaction(async (tx) => {
        const iRiwayat = await tx.riwayatTransaksi.create({
          data: {
            memberId: memberId,
            tipeTransaksi: 'deposit',
            createdAt: myDate,
            updatedAt: myDate,
          },
        });

        await tx.requestDeposit.create({
          data: {
            kode: kodeTrans,
            riwayatTransaksiId: iRiwayat.id,
            nominal: nominal,
            nominalTambahan: randCode,
            status: 'proses',
            bankTransferId: bankId,
            waktuRequest: myDate,
            statusKirim: 'belum_kirim',
            createdAt: myDate,
            updatedAt: myDate,
          },
        });
      });

      // Fire pengumuman
      this.pengumumanService.sendPengumuman({
          title: 'Tiket Deposit Berhasil',
          body: `Tiket deposit Rp ${nominal} berhasil dibuat. Silakan transfer sesuai instruksi.`,
          pengumumanType: 'Deposit',
          targetType: 'User',
          targetId: memberId.toString(),
          payload: { kodeTrans, nominal }
      }).catch(e => console.error('Failed to send deposit pengumuman', e));

      return {
        error: false,
        error_msg: 'Tiket Deposit Saldo Berhasil Digenerated',
      };
    } catch (error) {
      return {
        error: true,
        error_msg: 'Proses ambil tiket deposit saldo gagal dilakukan.',
      };
    }
  }
}
