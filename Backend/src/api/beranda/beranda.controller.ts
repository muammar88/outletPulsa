import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { BerandaService } from './beranda.service';
import { JwtApiGuard } from '../guards/jwt-api.guard';

@Controller('api/beranda')
export class BerandaController {
  constructor(private readonly berandaService: BerandaService) {}

  @UseGuards(JwtApiGuard)
  @Get()
  async getBeranda(@Request() req) {
    const kode = req.user.kode;
    const data = await this.berandaService.getBerandaData(kode);
    return data;
  }
}
