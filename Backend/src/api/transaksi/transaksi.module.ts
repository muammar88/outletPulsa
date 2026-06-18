import { Module } from '@nestjs/common';
import { TransaksiController } from './transaksi.controller';
import { TransaksiService } from './transaksi.service';
import { PrismaService } from '../../prisma.service';
import { ProviderService } from '../provider/provider.service';

@Module({
  controllers: [TransaksiController],
  providers: [TransaksiService, PrismaService, ProviderService],
})
export class TransaksiModule {}
