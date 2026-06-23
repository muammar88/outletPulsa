import { Controller, Get, Post, Body, Request, UseGuards } from '@nestjs/common';
import { JwtApiGuard } from '../guards/jwt-api.guard';
import { TransaksiPascabayarService } from './transaksi-pascabayar.service';

@Controller('api')
@UseGuards(JwtApiGuard)
export class TransaksiPascabayarController {
  constructor(private readonly transaksiPascabayarService: TransaksiPascabayarService) {}

  @Get('riwayat-pascabayar')
  async getRiwayatPascabayar(@Request() req: any) {
    const memberId = req.user.id;
    return await this.transaksiPascabayarService.getRiwayatPascabayar(memberId);
  }

  @Post('daftar-kategori-pascabayar')
  async getDaftarKategoriPascabayar(@Body() body: any) {
    const { kode } = body;
    return await this.transaksiPascabayarService.getDaftarKategoriPascabayar(kode);
  }

  @Post('pascabayar-inquiry')
  async inquiryPascabayar(@Request() req: any, @Body() body: any) {
    const memberId = req.user.id;
    const { product_code } = body;
    let { nomor_tujuan } = body;
    if (nomor_tujuan) {
      nomor_tujuan = nomor_tujuan.replace(/\s+/g, '');
    }
    return await this.transaksiPascabayarService.inquiryPascabayar(memberId, product_code, nomor_tujuan);
  }

  @Post('pascabayar-pembayaran')
  async pembayaranPascabayar(@Request() req: any, @Body() body: any) {
    const memberId = req.user.id;
    // Mobile sends tr_id inside body
    const tr_id = body.tr_id || body.trId;
    return await this.transaksiPascabayarService.pembayaranPascabayar(memberId, tr_id);
  }
}
