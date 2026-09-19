import { Controller, Get, Query } from '@nestjs/common';
import { TransaksiLinkquService } from './transaksi_linkqu.service';

@Controller('administrator/transaksi-linkqu')
export class TransaksiLinkquController {
  constructor(private readonly transaksiLinkquService: TransaksiLinkquService) {}

  @Get()
  async findAll(@Query() query: any) {
    return await this.transaksiLinkquService.findAll(query);
  }
}
