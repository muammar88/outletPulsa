import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma.service';
import * as bcrypt from 'bcryptjs';
import { generateSecret, generateURI, verifySync } from 'otplib';
import * as QRCode from 'qrcode';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(kode: string, pass: string) {
    const user = await this.prisma.user.findFirst({
      where: { kode },
      include: {
        group: {
          include: {
            permissions: {
              include: { permission: true }
            }
          }
        }
      }
    });

    if (!user) {
      throw new UnauthorizedException('Username atau Password salah');
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Username atau Password salah');
    }

    // Jika 2FA aktif, kembalikan temp token untuk verifikasi OTP
    if (user.twoFactorEnabled && user.twoFactorSecret) {
      const tempPayload = { sub: user.id, kode: user.kode, purpose: '2fa_verify' };
      const tempToken = this.jwtService.sign(tempPayload, {
        expiresIn: '5m', // Token sementara berlaku 5 menit
      });

      return {
        requiresTwoFactor: true,
        tempToken,
      };
    }

    // Jika 2FA tidak aktif, login langsung
    return this.generateAuthTokens(user);
  }

  async verifyTwoFactor(tempToken: string, otpCode: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(tempToken);
    } catch {
      throw new UnauthorizedException('Sesi verifikasi telah kedaluwarsa. Silakan login ulang.');
    }

    if (payload.purpose !== '2fa_verify') {
      throw new UnauthorizedException('Token tidak valid untuk verifikasi 2FA');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        group: {
          include: {
            permissions: {
              include: { permission: true }
            }
          }
        }
      }
    });

    if (!user || !user.twoFactorSecret) {
      throw new UnauthorizedException('User tidak ditemukan atau 2FA belum dikonfigurasi');
    }

    const result = verifySync({
      token: otpCode,
      secret: user.twoFactorSecret,
    });

    if (!result.valid) {
      throw new UnauthorizedException('Kode OTP salah atau sudah kedaluwarsa');
    }

    return this.generateAuthTokens(user);
  }

  async setupTwoFactor(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan');
    }

    const secret = generateSecret();
    const otpauthUrl = generateURI({
      issuer: 'OutletPulsa',
      label: user.kode,
      secret,
      algorithm: 'sha1',
      digits: 6,
      period: 30,
    });

    // Simpan secret (belum aktif sampai di-enable)
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret },
    });

    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    return {
      secret,
      qrCode: qrCodeDataUrl,
      otpauthUrl,
    };
  }

  async enableTwoFactor(userId: number, otpCode: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFactorSecret) {
      throw new UnauthorizedException('Silakan setup 2FA terlebih dahulu');
    }

    const result = verifySync({
      token: otpCode,
      secret: user.twoFactorSecret,
    });

    if (!result.valid) {
      throw new UnauthorizedException('Kode OTP salah. Pastikan waktu perangkat Anda sinkron.');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });

    return { message: 'Two-Factor Authentication berhasil diaktifkan' };
  }

  async disableTwoFactor(userId: number, password: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Password salah');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: false, twoFactorSecret: null },
    });

    return { message: 'Two-Factor Authentication berhasil dinonaktifkan' };
  }

  async getTwoFactorStatus(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorEnabled: true },
    });

    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan');
    }

    return { twoFactorEnabled: user.twoFactorEnabled };
  }

  private async generateAuthTokens(user: any) {
    const payload = { sub: user.id, kode: user.kode, type: user.type };

    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'refresh_secret_key',
      expiresIn: (process.env.JWT_REFRESH_EXPIRES || '7d') as any,
    });

    // Save refresh token to user
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: refresh_token },
    });

    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        kode: user.kode,
        name: user.name,
        type: user.type,
        group: user.group ? {
          id: user.group.id,
          name: user.group.name,
          permissions: user.group.permissions.map((p: any) => p.permission.name)
        } : null
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh_secret_key',
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newPayload = { sub: user.id, kode: user.kode, type: user.type };
      const access_token = this.jwtService.sign(newPayload);

      return { access_token };
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }
}
