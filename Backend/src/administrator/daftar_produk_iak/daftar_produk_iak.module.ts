import { Module } from '@nestjs/common';
import { DaftarProdukIakService } from './daftar_produk_iak.service';
import { DaftarProdukIakController } from './daftar_produk_iak.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [DaftarProdukIakController],
  providers: [DaftarProdukIakService, PrismaService],
})
export class DaftarProdukIakModule {}
