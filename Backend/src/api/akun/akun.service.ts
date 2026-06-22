import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { UpdateNamaDto } from './dto/update-nama.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import * as bcrypt from 'bcryptjs';
import { TransferSaldoDto } from './dto/transfer-saldo.dto';

@Injectable()
export class AkunService {
  constructor(private readonly prisma: PrismaService) {}

  async updateNama(memberKode: string, dto: UpdateNamaDto) {
    try {
      const member = await this.prisma.member.findFirst({
        where: { kode: memberKode },
      });

      if (!member) {
        throw new NotFoundException('Data akun tidak ditemukan');
      }

      await this.prisma.member.update({
        where: { id: member.id },
        data: {
          fullname: dto.nama,
        },
      });

      return {
        error: false,
        error_msg: 'Berhasil mengubah nama akun',
        data: { success: true },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Terjadi kesalahan pada server');
    }
  }

  async updatePassword(memberKode: string, dto: UpdatePasswordDto) {
    try {
      if (dto.passwordBaru !== dto.konfirmasiPassword) {
        throw new BadRequestException('Konfirmasi password tidak sesuai dengan password baru');
      }

      const member = await this.prisma.member.findFirst({
        where: { kode: memberKode },
      });

      if (!member) {
        throw new NotFoundException('Data akun tidak ditemukan');
      }

      const isPasswordValid = await bcrypt.compare(dto.passwordLama, member.password);
      if (!isPasswordValid) {
        throw new BadRequestException('Password lama salah');
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(dto.passwordBaru, salt);

      await this.prisma.member.update({
        where: { id: member.id },
        data: {
          password: hashedPassword,
        },
      });

      return {
        error: false,
        error_msg: 'Berhasil mengubah password akun',
        data: { success: true },
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Terjadi kesalahan pada server');
    }
  }

  async transferSaldo(senderId: number, dto: TransferSaldoDto) {
    try {
      // Menggunakan Prisma transaction agar atomik
      return await this.prisma.$transaction(async (tx) => {
        // 1. Ambil data pengirim
        const sender = await tx.member.findUnique({
          where: { id: senderId }
        });

        if (!sender) {
          throw new NotFoundException('Data pengirim tidak ditemukan');
        }

        // 2. Verifikasi status akun pengirim
        if (sender.status === 'unverified') {
          throw new BadRequestException('Akun Anda belum terverifikasi. Tidak dapat melakukan transfer saldo.');
        }

        // 3. Verifikasi password pengirim
        const isPasswordValid = await bcrypt.compare(dto.password, sender.password);
        if (!isPasswordValid) {
          throw new BadRequestException('Kata sandi salah.');
        }

        // 3. Verifikasi ketersediaan saldo pengirim
        const nominalStr = dto.nominal.toString().replace(/\D/g, '');
        const nominalTransfer = parseInt(nominalStr, 10);

        if (isNaN(nominalTransfer) || nominalTransfer <= 0) {
          throw new BadRequestException('Nominal transfer tidak valid');
        }

        const saldoPengirim = sender.saldo || 0;
        if (saldoPengirim < nominalTransfer) {
          throw new BadRequestException('Saldo tidak mencukupi.');
        }

        // 4. Cari penerima berdasarkan nomor_tujuan (whatsappnumber)
        const receiver = await tx.member.findFirst({
          where: { whatsappnumber: dto.nomor_tujuan }
        });

        if (!receiver) {
          throw new NotFoundException('Nomor tujuan tidak terdaftar');
        }

        if (receiver.id === sender.id) {
          throw new BadRequestException('Tidak bisa transfer ke akun sendiri');
        }

        // 5. Kurangi saldo pengirim
        const updatedSender = await tx.member.update({
          where: { id: sender.id },
          data: { saldo: { decrement: nominalTransfer } }
        });

        // 6. Tambah saldo penerima
        const updatedReceiver = await tx.member.update({
          where: { id: receiver.id },
          data: { saldo: { increment: nominalTransfer } }
        });

        // 7. Catat RiwayatSaldo untuk pengirim (Keluar)
        await tx.riwayatSaldo.create({
          data: {
            kode: sender.kode,
            member_id: sender.id,
            nominal: nominalTransfer,
            saldo_sebelumnya: saldoPengirim,
            saldo_setelahnya: updatedSender.saldo || 0,
            status: 'transfer_pulsa', // Sesuaikan enum
            ket: `Transfer saldo ke ${receiver.fullname} (${receiver.whatsappnumber})`
          }
        });

        // 8. Catat RiwayatSaldo untuk penerima (Masuk)
        const saldoPenerimaSebelum = receiver.saldo || 0;
        await tx.riwayatSaldo.create({
          data: {
            kode: receiver.kode,
            member_id: receiver.id,
            nominal: nominalTransfer,
            saldo_sebelumnya: saldoPenerimaSebelum,
            saldo_setelahnya: updatedReceiver.saldo || 0,
            status: 'transfer_pulsa', // Sesuaikan enum
            ket: `Terima transfer saldo dari ${sender.fullname} (${sender.whatsappnumber})`
          }
        });

        // Ingat format respons sesuai permintaan user: error: boolean, message: string
        return {
          error: false,
          message: 'Transfer saldo berhasil'
        };
      });
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Terjadi kesalahan pada server saat transfer saldo');
    }
  }
}
