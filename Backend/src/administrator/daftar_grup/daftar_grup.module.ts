import { Module } from '@nestjs/common';
import { DaftarGrupService } from './daftar_grup.service';
import { DaftarGrupController } from './daftar_grup.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [DaftarGrupController],
  providers: [DaftarGrupService, PrismaService],
})
export class DaftarGrupModule {}
