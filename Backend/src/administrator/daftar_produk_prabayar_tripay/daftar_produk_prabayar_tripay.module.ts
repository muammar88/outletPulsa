import { Module } from '@nestjs/common';
import { DaftarProdukPrabayarTripayController } from './daftar_produk_prabayar_tripay.controller';
import { DaftarProdukPrabayarTripayService } from './daftar_produk_prabayar_tripay.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [DaftarProdukPrabayarTripayController],
  providers: [DaftarProdukPrabayarTripayService, PrismaService],
  exports: [DaftarProdukPrabayarTripayService],
})
export class DaftarProdukPrabayarTripayModule {}
