import { Module } from '@nestjs/common';
import { DaftarProdukTripayController } from './daftar_produk_tripay.controller';
import { DaftarProdukTripayService } from './daftar_produk_tripay.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [DaftarProdukTripayController],
  providers: [DaftarProdukTripayService, PrismaService],
})
export class DaftarProdukTripayModule {}
