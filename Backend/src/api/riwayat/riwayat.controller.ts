import { Controller, Get, Post, UseGuards, Request, Body } from '@nestjs/common';
import { JwtApiGuard } from '../guards/jwt-api.guard';

@Controller('api')
export class RiwayatController {
  // ── Riwayat Prabayar ─────────────────────────────
  @UseGuards(JwtApiGuard)
  @Get('riwayat-prabayar')
  getRiwayatPrabayar() {
    return { error: false, error_msg: '', list: {} };
  }

  // ── Riwayat Pascabayar ────────────────────────────
  @UseGuards(JwtApiGuard)
  @Get('riwayat-pascabayar')
  getRiwayatPascabayar() {
    return { error: false, error_msg: '', list: {} };
  }

  // ── Riwayat Deposit ───────────────────────────────
  @UseGuards(JwtApiGuard)
  @Get('riwayat-deposit')
  getRiwayatDeposit() {
    return { error: false, error_msg: '', list: {} };
  }

  // ── Riwayat Transfer Saldo ────────────────────────
  @UseGuards(JwtApiGuard)
  @Get('riwayat-transfer-saldo')
  getRiwayatTransferSaldo() {
    return { error: false, error_msg: '', list: {} };
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
