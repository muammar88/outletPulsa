import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BankService } from './bank.service';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { GetBankDto } from './dto/get-bank.dto';

@Controller('administrator/bank')
export class BankController {
  constructor(private readonly bankService: BankService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(@Body() createBankDto: CreateBankDto, @UploadedFile() file?: Express.Multer.File) {
    return this.bankService.create(createBankDto, file);
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
  @UseInterceptors(FileInterceptor('image'))
  update(@Param('id') id: string, @Body() updateBankDto: UpdateBankDto, @UploadedFile() file?: Express.Multer.File) {
    return this.bankService.update(+id, updateBankDto, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bankService.remove(+id);
  }
}
