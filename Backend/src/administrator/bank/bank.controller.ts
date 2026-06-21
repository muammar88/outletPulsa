import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query } from '@nestjs/common';
import { BankService } from './bank.service';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { GetBankDto } from './dto/get-bank.dto';

@Controller('administrator/bank')
export class BankController {
  constructor(private readonly bankService: BankService) {}

  @Post()
  create(@Body() createBankDto: CreateBankDto) {
    return this.bankService.create(createBankDto);
  }

  @Get()
  findAll(@Query() query: GetBankDto) {
    return this.bankService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bankService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateBankDto: UpdateBankDto) {
    return this.bankService.update(+id, updateBankDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bankService.remove(+id);
  }
}
