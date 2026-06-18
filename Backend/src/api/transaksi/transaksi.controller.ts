import { Controller, Get, Post, Body, UseGuards, Request, Query } from '@nestjs/common';
import { JwtApiGuard } from '../guards/jwt-api.guard';
import { TransaksiService } from './transaksi.service';
import { CreateTransaksiPrabayarDto } from './dto/create-transaksi-prabayar.dto';

@Controller('api')
// @UseGuards(JwtApiGuard)
export class TransaksiController {
  constructor(
    private readonly transaksiService: TransaksiService
  ) {}

  @Get('riwayat-prabayar')
  async getRiwayatPrabayar(@Request() req: any) {
    // req.user is populated by JwtApiGuard (usually contains { sub: memberId, email, dll })
    const memberId = 1; // req.user.sub;
    return await this.transaksiService.getRiwayatPrabayar(memberId);
  }

  @Post('transaksi-prabayar')
  async createTransaksiPrabayar(@Body() body: CreateTransaksiPrabayarDto, @Request() req: any) {
    if (body.nomor_tujuan) {
      body.nomor_tujuan = body.nomor_tujuan.replace(/\s+/g, '');
    }
    // TODO: Gunakan req.user.sub setelah auth aktif
    const memberId = 1;
    return await this.transaksiService.createTransaksiPrabayar(memberId, body);
  }

  @Post('transaksi-detail')
  async getDetailTransaksiPrabayar(@Body('kode_transaksi') kodeTransaksi: string, @Request() req: any) {
    if (!kodeTransaksi) {
      return { error: true, error_msg: 'Parameter kode_transaksi wajib diisi' };
    }
    // TODO: Gunakan req.user.sub setelah auth aktif
    const memberId = 1;
    return await this.transaksiService.getDetailTransaksiPrabayar(memberId, kodeTransaksi);
  }
}
