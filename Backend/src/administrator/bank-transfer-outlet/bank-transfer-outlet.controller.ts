import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query } from '@nestjs/common';
import { BankTransferOutletService } from './bank-transfer-outlet.service';
import { CreateBankTransferOutletDto } from './dto/create-bank-transfer-outlet.dto';
import { UpdateBankTransferOutletDto } from './dto/update-bank-transfer-outlet.dto';
import { GetBankTransferOutletDto } from './dto/get-bank-transfer-outlet.dto';

@Controller('administrator/bank-transfer-outlet')
export class BankTransferOutletController {
  constructor(private readonly bankTransferOutletService: BankTransferOutletService) {}

  @Post()
  create(@Body() createBankTransferOutletDto: CreateBankTransferOutletDto) {
    return this.bankTransferOutletService.create(createBankTransferOutletDto);
  }

  @Get()
  findAll(@Query() query: GetBankTransferOutletDto) {
    return this.bankTransferOutletService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bankTransferOutletService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateBankTransferOutletDto: UpdateBankTransferOutletDto) {
    return this.bankTransferOutletService.update(+id, updateBankTransferOutletDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bankTransferOutletService.remove(+id);
  }
}
