import { Controller, Post, Body, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { AkunService } from './akun.service';
import { JwtApiGuard } from '../guards/jwt-api.guard';
import { UpdateNamaDto } from './dto/update-nama.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('api/akun')
@UseGuards(JwtApiGuard)
export class AkunController {
  constructor(private readonly akunService: AkunService) {}

  @Post('akun-update-nama')
  async updateNama(@Request() req, @Body() dto: UpdateNamaDto) {
    try {
      const result = await this.akunService.updateNama(req.user.kode, dto);
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        const response: any = error.getResponse();
        let message = error.message;
        if (typeof response === 'object' && response !== null && Array.isArray(response.message)) {
          message = response.message[0]; // Ambil pesan validasi pertama
        }
        return {
          error: true,
          error_msg: message,
        };
      }
      return {
        error: true,
        error_msg: 'Terjadi kesalahan pada server',
      };
    }
  }

  @Post('akun-update-password')
  async updatePassword(@Request() req, @Body() dto: UpdatePasswordDto) {
    try {
      const result = await this.akunService.updatePassword(req.user.kode, dto);
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        const response: any = error.getResponse();
        let message = error.message;
        if (typeof response === 'object' && response !== null && Array.isArray(response.message)) {
          message = response.message[0]; // Ambil pesan validasi pertama
        }
        return {
          error: true,
          error_msg: message,
        };
      }
      return {
        error: true,
        error_msg: 'Terjadi kesalahan pada server',
      };
    }
  }
}
