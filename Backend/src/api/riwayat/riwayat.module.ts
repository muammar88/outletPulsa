import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { RiwayatController } from './riwayat.controller';
import { JwtApiStrategy } from '../strategies/jwt-api.strategy';
import { RiwayatService } from './riwayat.service';
import { PrismaService } from '../../prisma.service';

@Module({
  imports: [PassportModule],
  controllers: [RiwayatController],
  providers: [JwtApiStrategy, RiwayatService, PrismaService],
})
export class RiwayatModule {}
