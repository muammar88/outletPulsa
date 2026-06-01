import { Module } from '@nestjs/common';
import { SemuaProdukController } from './semua_produk.controller';
import { SemuaProdukService } from './semua_produk.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [SemuaProdukController],
  providers: [SemuaProdukService, PrismaService]
})
export class SemuaProdukModule {}
