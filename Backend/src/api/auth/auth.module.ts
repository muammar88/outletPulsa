import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../../prisma.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      global: true, // Membuat JwtService tersedia untuk injeksi secara global
      secret: process.env.JWT_SECRET || 'rahasia-outletpulsa-mobile',
      signOptions: { expiresIn: '30d' }, // Sesi login berlaku selama 30 hari di mobile
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService],
})
export class AuthModule {}
