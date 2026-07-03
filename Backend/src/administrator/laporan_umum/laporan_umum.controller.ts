import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { LaporanUmumService } from './laporan_umum.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('administrator/laporan-umum')
export class LaporanUmumController {
  constructor(private readonly laporanUmumService: LaporanUmumService) {}

  @Get('summary')
  async getSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const data = await this.laporanUmumService.getSummary(startDate, endDate);
    return {
      statusCode: 200,
      message: 'Berhasil mengambil data laporan umum',
      data,
    };
  }

  @Get('table')
  async getTable(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('type') type?: string
  ) {
    const data = await this.laporanUmumService.getTableData({ page, limit, search, startDate, endDate, type });
    return {
      statusCode: 200,
      message: 'Berhasil mengambil tabel laporan umum',
      data,
    };
  }
}
