import { Module } from '@nestjs/common';
import { KategoriPrabayarTripayService } from './kategori_prabayar_tripay.service';
import { KategoriPrabayarTripayController } from './kategori_prabayar_tripay.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [KategoriPrabayarTripayController],
  providers: [KategoriPrabayarTripayService, PrismaService],
  exports: [KategoriPrabayarTripayService],
})
export class KategoriPrabayarTripayModule {}
