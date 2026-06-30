import { Controller, Get, Post, UseGuards, Request, Body, Query } from '@nestjs/common';
import { JwtApiGuard } from '../guards/jwt-api.guard';
import { RiwayatService } from './riwayat.service';

@Controller('api')
export class RiwayatController {
  constructor(private readonly riwayatService: RiwayatService) {}

  // ── Riwayat Prabayar ─────────────────────────────

  // ── Riwayat Pascabayar ────────────────────────────
  // Moved to TransaksiPascabayarModule

  // ── Riwayat Deposit ───────────────────────────────
  @UseGuards(JwtApiGuard)
  @Get('riwayat-deposit')
  getRiwayatDeposit(@Request() req, @Query('page') page?: string, @Query('limit') limit?: string, @Query('search') search?: string) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 20;
    return this.riwayatService.getRiwayatDeposit(req.user.kode, pageNumber, limitNumber, search);
  }

  @UseGuards(JwtApiGuard)
  @Post('deposit-detail')
  getDetailDeposit(@Request() req, @Body('id') id: string | number) {
    return this.riwayatService.getDetailDeposit(req.user.kode, Number(id));
  }

  // ── Riwayat Transfer Saldo ────────────────────────
  @UseGuards(JwtApiGuard)
  @Get('riwayat-transfer-saldo')
  getRiwayatTransferSaldo(@Request() req, @Query('page') page?: string, @Query('limit') limit?: string, @Query('search') search?: string) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 20;
    return this.riwayatService.getRiwayatTransferSaldo(req.user.kode, pageNumber, limitNumber, search);
  }

  // ── Info Belum Baca ───────────────────────────────
  @UseGuards(JwtApiGuard)
  @Get('info-belum-baca')
  getInfoBelumBaca() {
    return { error: false, error_msg: '', list: {} };
  }

  // ── Info Sudah Baca ───────────────────────────────
  @UseGuards(JwtApiGuard)
  @Get('info-sudah-baca')
  getInfoSudahBaca() {
    return { error: false, error_msg: '', list: {} };
  }

  // ── Update Status Baca ────────────────────────────
  @UseGuards(JwtApiGuard)
  @Post('info-update-baca')
  updateStatusBaca(@Body() body: any) {
    return { error: false, error_msg: '' };
  }
}
