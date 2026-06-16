import { Module } from '@nestjs/common';
import { TransaksiController } from './transaksi.controller';
import { TransaksiService } from './transaksi.service';
import { TransaksiPrabayarService } from './transaksi-prabayar.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [TransaksiController],
  providers: [TransaksiService, TransaksiPrabayarService, PrismaService],
})
export class TransaksiModule {}
