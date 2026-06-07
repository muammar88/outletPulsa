import { Module } from '@nestjs/common';
import { ProdukService } from './produk.service';
import { ProdukController } from './produk.controller';
import { KategoriController } from './kategori.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtApiStrategy } from '../strategies/jwt-api.strategy';
import { PrismaService } from '../../prisma.service';

@Module({
  imports: [PassportModule],
  controllers: [ProdukController, KategoriController],
  providers: [ProdukService, PrismaService, JwtApiStrategy],
})
export class ProdukModule {}
