import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { DepositService } from './deposit.service';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { DepositManualDto } from './dto/deposit-manual.dto';
import { UpdateDepositDto } from './dto/update-deposit.dto';
import { GetDepositDto } from './dto/get-deposit.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('administrator/deposit')
@UseGuards(JwtAuthGuard)
export class DepositController {
  constructor(private readonly depositService: DepositService) {}

  @Post('manual')
  async manualDeposit(@Body() dto: DepositManualDto, @Req() req: any) {
    const adminId = req.user.id;
    const data = await this.depositService.manualDeposit(dto, adminId);
    return {
      message: 'Deposit manual berhasil diproses',
      error: null,
      data,
    };
  }

  @Get()
  async findAll(@Query() query: GetDepositDto) {
    const data = await this.depositService.findAll(query);
    return {
      message: 'Success',
      error: null,
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.depositService.findOne(+id);
    return {
      message: 'Success',
      error: null,
      data,
    };
  }

  @Post()
  async create(@Body() createDepositDto: CreateDepositDto) {
    const data = await this.depositService.create(createDepositDto);
    return {
      message: 'Data riwayat berhasil ditambahkan',
      error: null,
      data,
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDepositDto: UpdateDepositDto) {
    const data = await this.depositService.update(+id, updateDepositDto);
    return {
      message: 'Data riwayat berhasil diperbarui',
      error: null,
      data,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.depositService.remove(+id);
    return {
      message: 'Data riwayat berhasil dihapus',
      error: null,
      data: null,
    };
  }
}
