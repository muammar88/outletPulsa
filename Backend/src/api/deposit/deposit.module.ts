import { Module } from '@nestjs/common';
import { DepositController } from './deposit.controller';
import { DepositService } from './deposit.service';
import { PrismaService } from '../../prisma.service';
import { PengumumanModule } from '../../pengumuman/pengumuman.module';
import { LinkquReconciliationService } from '../webhook/linkqu-reconciliation.service';

@Module({
  imports: [PengumumanModule],
  controllers: [DepositController],
  providers: [DepositService, PrismaService, LinkquReconciliationService],
})
export class DepositModule {}
