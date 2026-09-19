import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { BankLinkquService } from './bank_linkqu.service';

@Controller('administrator/bank-linkqu')
export class BankLinkquController {
  constructor(private readonly bankLinkquService: BankLinkquService) {}

  @Get()
  async findAll() {
    return await this.bankLinkquService.findAll();
  }

  @Post('sync')
  async sync() {
    return await this.bankLinkquService.sync();
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: boolean,
  ) {
    return await this.bankLinkquService.updateStatus(+id, status);
  }
}
