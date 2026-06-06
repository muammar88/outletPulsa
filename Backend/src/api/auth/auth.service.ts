import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Fungsi untuk memvalidasi kredensial login member dari aplikasi mobile
   */
  async login(loginDto: LoginDto) {
    const { whatsapp_number, password } = loginDto;

    // 1. Cari member berdasarkan whatsappnumber
    const member = await this.prisma.member.findFirst({
      where: { whatsappnumber: whatsapp_number },
    });

    // 2. Jika member tidak ada
    if (!member) {
      return {
        message: 'Nomor WhatsApp atau kata sandi salah.',
        data: null,
      };
    }

    // 3. Validasi password menggunakan bcrypt
    const isPasswordValid = await bcrypt.compare(password, member.password);
    if (!isPasswordValid) {
      return {
        message: 'Nomor WhatsApp atau kata sandi salah.',
        data: null,
      };
    }

    // 4. Jika sukses, buat payload untuk JWT
    const payload = { sub: member.id, kode: member.kode, wa: member.whatsappnumber };
    const token = await this.jwtService.signAsync(payload);

    // 5. Kembalikan response sukses menggunakan property data
    return {
      message: 'Login Berhasil',
      data: {
        token: token,
        kode: member.kode,
      },
    };
  }

  /**
   * Fungsi untuk memvalidasi token JWT dari aplikasi mobile
   */
  async checkLogin(token: string) {
    if (!token) {
      return { message: 'Token tidak ditemukan', data: null };
    }
    try {
      this.jwtService.verify(token);
      return { message: 'Token valid', data: { valid: true } };
    } catch (e) {
      return { message: 'Token tidak valid atau expired', data: null };
    }
  }
}
