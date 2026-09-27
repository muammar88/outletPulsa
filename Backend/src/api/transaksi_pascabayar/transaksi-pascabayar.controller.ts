import { Controller, Get, Post, Body, Request, UseGuards, Query } from '@nestjs/common';
import { JwtApiGuard } from '../guards/jwt-api.guard';
import { TransaksiPascabayarService } from './transaksi-pascabayar.service';

@Controller('api')
@UseGuards(JwtApiGuard)
export class TransaksiPascabayarController {
  constructor(private readonly transaksiPascabayarService: TransaksiPascabayarService) {}

  @Get('riwayat-pascabayar')
  async getRiwayatPascabayar(@Request() req: any, @Query('search') search?: string) {
    const memberId = req.user.id;
    return await this.transaksiPascabayarService.getRiwayatPascabayar(memberId, search);
  }

  @Post('daftar-kategori-pascabayar')
  async getDaftarKategoriPascabayar(@Body() body: any) {
    const { kode } = body;
    return await this.transaksiPascabayarService.getDaftarKategoriPascabayar(kode);
  }

  @Post('pascabayar-inquiry')
  async inquiryPascabayar(@Request() req: any, @Body() body: any) {
    const memberId = req.user.id;
    const { product_code, additional_data } = body;
    let { nomor_tujuan } = body;
    if (nomor_tujuan) {
      nomor_tujuan = String(nomor_tujuan).replace(/\s+/g, '');
    }
    const additionalData =
      additional_data && typeof additional_data === 'object' && !Array.isArray(additional_data)
        ? additional_data
        : null;
    return await this.transaksiPascabayarService.inquiryPascabayar(memberId, product_code, nomor_tujuan, additionalData);
  }

  @Post('pascabayar-pembayaran')
  async pembayaranPascabayar(@Request() req: any, @Body() body: any) {
    const memberId = req.user.id;
    const tr_id = body.tr_id || body.trId;
    return await this.transaksiPascabayarService.pembayaranPascabayar(memberId, tr_id);
  }

  @Post('pascabayar-status')
  async statusPascabayar(@Request() req: any, @Body() body: any) {
    const memberId = req.user.id;
    const tr_id = body.tr_id || body.trId || body.kode_transaksi;
    return await this.transaksiPascabayarService.checkStatusPascabayar(memberId, tr_id);
  }

  @Post('transaksi-detail-pascabayar')
  async detailTransaksiPascabayar(@Request() req: any, @Body() body: any) {
    const memberId = req.user.id;
    const kodeTransaksi = body.kode_transaksi || body.tr_id || body.trId || body.kode;
    return await this.transaksiPascabayarService.getDetailPascabayar(memberId, kodeTransaksi);
  }
}
