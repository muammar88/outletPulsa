import { Module } from '@nestjs/common';
import { TransaksiPascabayarController } from './transaksi-pascabayar.controller';
import { TransaksiPascabayarService } from './transaksi-pascabayar.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [TransaksiPascabayarController],
  providers: [TransaksiPascabayarService, PrismaService],
})
export class TransaksiPascabayarModule {}
