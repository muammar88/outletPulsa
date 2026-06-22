import { Controller, Get, Post, Delete, UseGuards, Request, Body } from '@nestjs/common';
import { JwtApiGuard } from '../guards/jwt-api.guard';
import { JwtService } from '@nestjs/jwt';

/**
 * StubController — dummy endpoints sementara.
 * Semua route mengembalikan response kosong yang valid
 * agar mobile tidak mendapat error 404.
 * Ganti satu per satu dengan implementasi nyata.
 */
@Controller('api')
export class StubController {
  constructor(private readonly jwtService: JwtService) {}

  // ── DEPOSIT ───────────────────────────────────────





  /** GET /api/deposit-delete-konfirmasi */
  @UseGuards(JwtApiGuard)
  @Get('deposit-delete-konfirmasi')
  deleteKonfirmasiDeposit() {
    return { error: false, error_msg: '' };
  }

  /** GET /api/deposit-konfirmasi */
  @UseGuards(JwtApiGuard)
  @Get('deposit-konfirmasi')
  konfirmasiDeposit() {
    return { error: false, error_msg: '' };
  }


  // ── TRANSAKSI PRABAYAR ────────────────────────────
  /** POST /api/get-prefix */
  @UseGuards(JwtApiGuard)
  @Post('get-prefix')
  getPrefix(@Body() body: any) {
    return { error: false, error_msg: '' };
  }


  /** POST /api/daftar-produk-data */
  @UseGuards(JwtApiGuard)
  @Post('daftar-produk-data')
  getDaftarProdukData(@Body() body: any) {
    return { error: false, error_msg: '', list: {} };
  }

  /** POST /api/daftar-operator */
  @UseGuards(JwtApiGuard)
  @Post('daftar-operator')
  getDaftarOperator(@Body() body: any) {
    return { error: false, error_msg: '', list: {} };
  }


  // ── TRANSAKSI PASCABAYAR ──────────────────────────

  /** POST /api/transaksi-detail-pascabayar */
  @UseGuards(JwtApiGuard)
  @Post('transaksi-detail-pascabayar')
  detailTransaksiPascabayar(@Body() body: any) {
    return { error: false, error_msg: '', data: {} };
  }

  // ── AGEN ──────────────────────────────────────────
  /** GET /api/agen-daftar */
  @UseGuards(JwtApiGuard)
  @Get('agen-daftar')
  daftarAgen() {
    return { error: false, error_msg: '', list: {} };
  }

  /** GET /api/agen-riwayat-pembayaran */
  @UseGuards(JwtApiGuard)
  @Get('agen-riwayat-pembayaran')
  riwayatPembayaranAgen() {
    return { error: false, error_msg: '', list: {} };
  }

  // ── REGISTRASI (publik, tanpa JWT) ───────────────
  /** POST /api/otp-register */
  @Post('otp-register')
  getOTP(@Body() body: any) {
    return { error: false, error_msg: '' };
  }

  /** POST /api/otp-reset-password */
  @Post('otp-reset-password')
  getOTPResetPassword(@Body() body: any) {
    return { error: false, error_msg: '' };
  }

  /** POST /api/register */
  @Post('register')
  register(@Body() body: any) {
    return { error: false, error_msg: '' };
  }

  /** POST /api/reset-password */
  @Post('reset-password')
  resetPassword(@Body() body: any) {
    return { error: false, error_msg: '' };
  }
}
