import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { TransaksiLinkquService } from './transaksi_linkqu.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('administrator/transaksi-linkqu')
@UseGuards(JwtAuthGuard)
export class TransaksiLinkquController {
  constructor(private readonly transaksiLinkquService: TransaksiLinkquService) {}

  @Get()
  async findAll(@Query() query: any) {
    return await this.transaksiLinkquService.findAll(query);
  }

  @Get('uncredited-candidates')
  async getUncreditedCandidates(@Query() query: any) {
    return await this.transaksiLinkquService.getUncreditedCandidates(query);
  }
}
