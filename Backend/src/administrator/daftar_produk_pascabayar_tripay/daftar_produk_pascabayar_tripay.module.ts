import { Module } from '@nestjs/common';
import { DaftarProdukPascabayarTripayController } from './daftar_produk_pascabayar_tripay.controller';
import { DaftarProdukPascabayarTripayService } from './daftar_produk_pascabayar_tripay.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [DaftarProdukPascabayarTripayController],
  providers: [DaftarProdukPascabayarTripayService, PrismaService],
})
export class DaftarProdukPascabayarTripayModule {}
