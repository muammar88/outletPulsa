import { Module } from '@nestjs/common';
import { ProdukPrabayarController } from './produk_prabayar.controller';
import { ProdukPrabayarService } from './produk_prabayar.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [ProdukPrabayarController],
  providers: [ProdukPrabayarService, PrismaService]
})
export class ProdukPrabayarModule {}
