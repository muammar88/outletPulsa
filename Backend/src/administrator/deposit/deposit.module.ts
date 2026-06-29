import { Module } from '@nestjs/common';
import { DepositController } from './deposit.controller';
import { DepositService } from './deposit.service';
import { PrismaService } from '../../prisma.service';
import { PengumumanModule } from '../../pengumuman/pengumuman.module';

@Module({
  imports: [PengumumanModule],
  controllers: [DepositController],
  providers: [DepositService, PrismaService],
})
export class DepositModule {}
