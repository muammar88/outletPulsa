import { Module } from '@nestjs/common';
import { DaftarProdukDigiflazzController } from './daftar_produk_digiflazz.controller';
import { DaftarProdukDigiflazzService } from './daftar_produk_digiflazz.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [DaftarProdukDigiflazzController],
  providers: [DaftarProdukDigiflazzService, PrismaService],
  exports: [DaftarProdukDigiflazzService],
})
export class DaftarProdukDigiflazzModule {}
