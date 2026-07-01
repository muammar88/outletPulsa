import { Controller, Get, Post, UseGuards, Request, HttpException, HttpStatus, Query } from '@nestjs/common';
import { AgenService } from './agen.service';
import { JwtApiGuard } from '../guards/jwt-api.guard';

@Controller('api/agen')
@UseGuards(JwtApiGuard)
export class AgenController {
  constructor(private readonly agenService: AgenService) {}

  @Get('reseller')
  async getResellers(@Request() req, @Query('search') search?: string) {
    try {
      // req.user.kode adalah kode_member agen yang sedang login
      const result = await this.agenService.getResellers(req.user.kode, search);
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      return {
        error: true,
        error_msg: 'Terjadi kesalahan pada server saat mengambil data reseller',
        list: {}
      };
    }
  }

  @Get('transaksi')
  async getTransaksiReseller(@Request() req, @Query('search') search?: string) {
    try {
      const result = await this.agenService.getTransaksiReseller(req.user.kode, search);
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      return {
        error: true,
        error_msg: 'Terjadi kesalahan pada server saat mengambil histori transaksi reseller',
        data: {
          list: {}
        }
      };
    }
  }

  @Get('statistik')
  async getStatistik(@Request() req) {
    try {
      const result = await this.agenService.getStatistik(req.user.kode, req.user.id);
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      return {
        error: true,
        error_msg: 'Terjadi kesalahan pada server saat mengambil statistik',
        data: {}
      };
    }
  }

  @Post('klaim')
  async klaimFee(@Request() req) {
    try {
      const result = await this.agenService.klaimFee(req.user.kode, req.user.id);
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      return {
        error: true,
        error_msg: 'Terjadi kesalahan pada server saat memproses klaim',
        data: {}
      };
    }
  }

  @Get('riwayat-pembayaran')
  async getRiwayatPembayaran(@Request() req, @Query('search') search?: string) {
    try {
      const result = await this.agenService.getRiwayatPembayaran(req.user.id, search);
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      return {
        error: true,
        error_msg: 'Terjadi kesalahan pada server saat mengambil riwayat pembayaran',
        data: {}
      };
    }
  }
}
