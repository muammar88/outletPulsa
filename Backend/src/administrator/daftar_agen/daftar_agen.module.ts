import { Module } from '@nestjs/common';
import { DaftarAgenService } from './daftar_agen.service';
import { DaftarAgenController } from './daftar_agen.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [DaftarAgenController],
  providers: [DaftarAgenService, PrismaService],
})
export class DaftarAgenModule {}
