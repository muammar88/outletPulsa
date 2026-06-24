import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { LabaDiambilService } from './laba_diambil.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('administrator/laba-diambil')
export class LabaDiambilController {
  constructor(private readonly labaDiambilService: LabaDiambilService) {}

  @Get()
  async findAll(
    @Query('query') query: string,
    @Query('limit') limit: string,
    @Query('page') page: string,
  ) {
    const data = await this.labaDiambilService.findAll(
      query || '',
      parseInt(limit) || 10,
      parseInt(page) || 1,
    );
    return {
      success: true,
      message: 'Berhasil mengambil riwayat laba diambil',
      data,
    };
  }

  @Get('summary-unpaid')
  async getSummaryUnpaid() {
    const data = await this.labaDiambilService.getSummaryUnpaid();
    return {
      success: true,
      message: 'Berhasil mengambil summary laba',
      data,
    };
  }

  @Post('take')
  async takeLaba() {
    const data = await this.labaDiambilService.takeLaba();
    return {
      success: true,
      message: 'Berhasil melakukan pengambilan laba',
      data,
    };
  }
}
