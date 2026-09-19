import { Module } from '@nestjs/common';
import { BankLinkquService } from './bank_linkqu.service';
import { BankLinkquController } from './bank_linkqu.controller';

@Module({
  controllers: [BankLinkquController],
  providers: [BankLinkquService],
})
export class BankLinkquModule {}
