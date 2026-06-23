import { Controller, Get, Post, Body, UseGuards, Request, Query } from '@nestjs/common';
import { JwtApiGuard } from '../guards/jwt-api.guard';
import { TransaksiService } from './transaksi.service';
import { CreateTransaksiPrabayarDto } from './dto/create-transaksi-prabayar.dto';

@Controller('api')
@UseGuards(JwtApiGuard)
export class TransaksiController {
  constructor(
    private readonly transaksiService: TransaksiService
  ) {}

  @Get('riwayat-prabayar')
  async getRiwayatPrabayar(@Request() req: any) {
    const memberId = req.user.id;
    return await this.transaksiService.getRiwayatPrabayar(memberId);
  }

  @Post('transaksi-prabayar')
  async createTransaksiPrabayar(@Body() body: CreateTransaksiPrabayarDto, @Request() req: any) {
    if (body.nomor_tujuan) {
      body.nomor_tujuan = body.nomor_tujuan.replace(/\s+/g, '');
    }
    const memberId = req.user.id;
    return await this.transaksiService.createTransaksiPrabayar(memberId, body);
  }

  @Post('transaksi-detail')
  async getDetailTransaksiPrabayar(@Body('kode_transaksi') kodeTransaksi: string, @Request() req: any) {
    if (!kodeTransaksi) {
      return { error: true, error_msg: 'Parameter kode_transaksi wajib diisi' };
    }
    const memberId = req.user.id;
    return await this.transaksiService.getDetailTransaksiPrabayar(memberId, kodeTransaksi);
  }
}
