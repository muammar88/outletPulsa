import { Module } from '@nestjs/common';
import { DaftarProdukSellerDigiflazzController } from './daftar_produk_seller_digiflazz.controller';
import { DaftarProdukSellerDigiflazzService } from './daftar_produk_seller_digiflazz.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [DaftarProdukSellerDigiflazzController],
  providers: [DaftarProdukSellerDigiflazzService, PrismaService],
})
export class DaftarProdukSellerDigiflazzModule {}
