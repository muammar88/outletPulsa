import { Module } from '@nestjs/common';
import { KategoriTripayService } from './kategori_tripay.service';
import { KategoriTripayController } from './kategori_tripay.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [KategoriTripayController],
  providers: [KategoriTripayService, PrismaService],
  exports: [KategoriTripayService],
})
export class KategoriTripayModule {}
