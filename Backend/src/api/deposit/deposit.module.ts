import { Module } from '@nestjs/common';
import { DepositController } from './deposit.controller';
import { DepositService } from './deposit.service';
import { PrismaService } from '../../prisma.service';
import { NotificationModule } from '../../notification/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [DepositController],
  providers: [DepositService, PrismaService],
})
export class DepositModule {}
