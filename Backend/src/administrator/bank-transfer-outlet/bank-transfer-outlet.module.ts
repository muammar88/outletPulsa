import { Module } from '@nestjs/common';
import { BankTransferOutletService } from './bank-transfer-outlet.service';
import { BankTransferOutletController } from './bank-transfer-outlet.controller';

import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [BankTransferOutletController],
  providers: [BankTransferOutletService, PrismaService],
})
export class BankTransferOutletModule {}
