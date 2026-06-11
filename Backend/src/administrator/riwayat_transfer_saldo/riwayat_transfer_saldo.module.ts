import { Module } from '@nestjs/common';
import { RiwayatTransferSaldoService } from './riwayat_transfer_saldo.service';
import { RiwayatTransferSaldoController } from './riwayat_transfer_saldo.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  providers: [RiwayatTransferSaldoService, PrismaService],
  controllers: [RiwayatTransferSaldoController]
})
export class RiwayatTransferSaldoModule {}
