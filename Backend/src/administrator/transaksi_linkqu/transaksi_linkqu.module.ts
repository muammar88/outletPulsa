import { Module } from '@nestjs/common';
import { TransaksiLinkquController } from './transaksi_linkqu.controller';
import { TransaksiLinkquService } from './transaksi_linkqu.service';

@Module({
  controllers: [TransaksiLinkquController],
  providers: [TransaksiLinkquService],
})
export class TransaksiLinkquModule {}
