import { Module } from '@nestjs/common';
import { TransaksiPulsaController } from './transaksi_pulsa.controller';
import { TransaksiPulsaService } from './transaksi_pulsa.service';
import { PrismaService } from '../../prisma.service';
import { TransaksiModule } from '../../api/transaksi/transaksi.module';

@Module({
  imports: [TransaksiModule],
  controllers: [TransaksiPulsaController],
  providers: [TransaksiPulsaService, PrismaService],
  exports: [TransaksiPulsaService],
})
export class TransaksiPulsaModule {}
