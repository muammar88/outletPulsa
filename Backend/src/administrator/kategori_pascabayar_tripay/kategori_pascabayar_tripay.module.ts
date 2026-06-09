import { Module } from '@nestjs/common';
import { KategoriPascabayarTripayService } from './kategori_pascabayar_tripay.service';
import { KategoriPascabayarTripayController } from './kategori_pascabayar_tripay.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [KategoriPascabayarTripayController],
  providers: [KategoriPascabayarTripayService, PrismaService],
  exports: [KategoriPascabayarTripayService],
})
export class KategoriPascabayarTripayModule {}
