import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtApiGuard } from '../guards/jwt-api.guard';
import { TransaksiService } from './transaksi.service';
import { TransaksiPrabayarService } from './transaksi-prabayar.service';
import { CreateTransaksiPrabayarDto } from './dto/create-transaksi-prabayar.dto';

@Controller('api')
// @UseGuards(JwtApiGuard)
export class TransaksiController {
  constructor(
    private readonly transaksiService: TransaksiService,
    private readonly transaksiPrabayarService: TransaksiPrabayarService
  ) {}

  @Get('riwayat-prabayar')
  async getRiwayatPrabayar(@Request() req: any) {
    // req.user is populated by JwtApiGuard (usually contains { sub: memberId, email, dll })
    const memberId = 1; // req.user.sub;
    return await this.transaksiService.getRiwayatPrabayar(memberId);
  }

  @Post('transaksi-prabayar')
  async createTransaksiPrabayar(@Body() body: CreateTransaksiPrabayarDto, @Request() req: any) {
    // TODO: Gunakan req.user.sub setelah auth aktif
    const memberId = 1;
    return await this.transaksiPrabayarService.createTransaksi(memberId, body);
  }
}
