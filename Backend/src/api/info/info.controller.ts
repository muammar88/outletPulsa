import { Controller, Get, Post, Param, Body, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { InfoService } from './info.service';
import { JwtApiGuard } from '../guards/jwt-api.guard';

@Controller('api/info')
@UseGuards(JwtApiGuard)
export class InfoController {
  constructor(private readonly infoService: InfoService) {}

  @Get('belum-baca')
  async getBelumBaca(@Request() req) {
    const memberKode = req.user.kode;
    return this.infoService.getBelumBaca(memberKode);
  }

  @Get('sudah-baca')
  async getSudahBaca(@Request() req) {
    const memberKode = req.user.kode;
    return this.infoService.getSudahBaca(memberKode);
  }

  @Get('detail/:id')
  async getDetail(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const memberKode = req.user.kode;
    return this.infoService.getDetail(id, memberKode);
  }

  @Post('update-status-baca')
  async updateStatusBaca(@Body('id') id: number | string, @Request() req) {
    const memberKode = req.user.kode;
    return this.infoService.updateStatusBaca(Number(id), memberKode);
  }
}
