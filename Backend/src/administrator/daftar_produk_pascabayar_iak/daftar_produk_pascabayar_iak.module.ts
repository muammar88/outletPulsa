import { Module } from '@nestjs/common';
import { DaftarProdukPascabayarIakService } from './daftar_produk_pascabayar_iak.service';
import { DaftarProdukPascabayarIakController } from './daftar_produk_pascabayar_iak.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [DaftarProdukPascabayarIakController],
  providers: [DaftarProdukPascabayarIakService, PrismaService],
})
export class DaftarProdukPascabayarIakModule {}
