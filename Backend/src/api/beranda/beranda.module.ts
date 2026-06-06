import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { BerandaController } from './beranda.controller';
import { BerandaService } from './beranda.service';
import { JwtApiStrategy } from '../strategies/jwt-api.strategy';
import { PrismaService } from '../../prisma.service';

@Module({
  imports: [PassportModule],
  controllers: [BerandaController],
  providers: [BerandaService, JwtApiStrategy, PrismaService],
})
export class BerandaModule {}
