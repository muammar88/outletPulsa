import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { TransaksiPulsaService } from './transaksi_pulsa.service';
import { GetTransaksiDto } from './dto/get-transaksi.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('administrator/transaksi-pulsa')
@UseGuards(JwtAuthGuard)
export class TransaksiPulsaController {
  constructor(private readonly transaksiPulsaService: TransaksiPulsaService) {}

  @Get()
  async findAll(@Query() query: GetTransaksiDto) {
    const data = await this.transaksiPulsaService.findAll(query);
    return {
      message: 'Success',
      error: null,
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.transaksiPulsaService.findOne(+id);
    return {
      message: 'Success',
      error: null,
      data,
    };
  }

  @Post()
  async create(@Body() createData: any) {
    const data = await this.transaksiPulsaService.create(createData);
    return {
      message: 'Transaksi berhasil dibuat',
      error: null,
      data,
    };
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() updateDto: UpdateStatusDto) {
    const data = await this.transaksiPulsaService.updateStatus(+id, updateDto);
    return {
      message: 'Status transaksi berhasil diperbarui',
      error: null,
      data,
    };
  }
}
