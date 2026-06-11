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

  @Get('run-cron-job')
  async runCronJob() {
    const result = await this.transaksiPulsaService.runCronJob();
    return {
      message: result.message,
      error: null,
      data: null,
    };
  }

  @Get('check-status-server')
  async checkStatusServer() {
    const result = await this.transaksiPulsaService.checkStatusServer();
    return {
      message: result.message,
      error: null,
      data: null,
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

  @Post(':id/check-status')
  async reCheckStatus(@Param('id') id: string) {
    const data = await this.transaksiPulsaService.reCheckStatus(+id);
    return {
      message: data.message,
      error: null,
      data: null,
    };
  }

  @Post('delete')
  async deleteTransaksi(@Body('id') id: number) {
    const data = await this.transaksiPulsaService.delete(+id);
    return {
      message: 'Transaksi berhasil dihapus',
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
