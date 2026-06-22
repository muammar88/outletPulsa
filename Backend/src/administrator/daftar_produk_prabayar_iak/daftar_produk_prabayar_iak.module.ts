import { Module } from '@nestjs/common';
import { DaftarProdukPrabayarIakService } from './daftar_produk_prabayar_iak.service';
import { DaftarProdukPrabayarIakController } from './daftar_produk_prabayar_iak.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [DaftarProdukPrabayarIakController],
  providers: [DaftarProdukPrabayarIakService, PrismaService],
  exports: [DaftarProdukPrabayarIakService],
})
export class DaftarProdukPrabayarIakModule {}
