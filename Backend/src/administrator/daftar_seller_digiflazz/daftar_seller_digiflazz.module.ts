import { Module } from '@nestjs/common';
import { DaftarSellerDigiflazzController } from './daftar_seller_digiflazz.controller';
import { DaftarSellerDigiflazzService } from './daftar_seller_digiflazz.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [DaftarSellerDigiflazzController],
  providers: [DaftarSellerDigiflazzService, PrismaService],
})
export class DaftarSellerDigiflazzModule {}
