import { Module } from '@nestjs/common';
import { TransaksiController } from './transaksi.controller';
import { TransaksiService } from './transaksi.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [TransaksiController],
  providers: [TransaksiService, PrismaService],
})
export class TransaksiModule {}
