import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class BerandaService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Mengambil data beranda member berdasarkan kode member.
   * Mengembalikan info profil dan saldo member.
   */
  async getBerandaData(kode: string) {
    const member = await this.prisma.member.findFirst({
      where: { kode },
      select: {
        kode: true,
        fullname: true,
        whatsappnumber: true,
        saldo: true,
        status: true,
      },
    });

    if (!member) {
      throw new NotFoundException(`Member dengan kode ${kode} tidak ditemukan.`);
    }

    const statusDeposit = member.status === 'verfied';

    return {
      error: false,
      error_msg: '',
      kode: member.kode,
      name: member.fullname,
      nomor_whatsapp: member.whatsappnumber,
      saldo: member.saldo?.toString() ?? '0',
      status_deposit: false,
    };
  }
}
