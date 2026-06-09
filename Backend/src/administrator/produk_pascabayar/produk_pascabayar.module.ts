import { Module } from '@nestjs/common';
import { ProdukPascabayarController } from './produk_pascabayar.controller';
import { ProdukPascabayarService } from './produk_pascabayar.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [ProdukPascabayarController],
  providers: [ProdukPascabayarService, PrismaService]
})
export class ProdukPascabayarModule {}
