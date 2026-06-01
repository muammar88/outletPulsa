import { Module } from '@nestjs/common';
import { TransaksiPulsaController } from './transaksi_pulsa.controller';
import { TransaksiPulsaService } from './transaksi_pulsa.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [TransaksiPulsaController],
  providers: [TransaksiPulsaService, PrismaService],
})
export class TransaksiPulsaModule {}
