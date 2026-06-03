import { Module } from '@nestjs/common';
import { DaftarPenggunaService } from './daftar_pengguna.service';
import { DaftarPenggunaController } from './daftar_pengguna.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [DaftarPenggunaController],
  providers: [DaftarPenggunaService, PrismaService],
})
export class DaftarPenggunaModule {}
