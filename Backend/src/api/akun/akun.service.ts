import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { UpdateNamaDto } from './dto/update-nama.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import * as bcrypt from 'bcryptjs';

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
}
