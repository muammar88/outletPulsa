import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtApiGuard } from '../guards/jwt-api.guard';
import { TransaksiService } from './transaksi.service';

@Controller('api')
// @UseGuards(JwtApiGuard)
export class TransaksiController {
  constructor(private readonly transaksiService: TransaksiService) {}

  @Get('riwayat-prabayar')
  async getRiwayatPrabayar(@Request() req: any) {
    // req.user is populated by JwtApiGuard (usually contains { sub: memberId, email, dll })
    const memberId = 1; // req.user.sub;
    return await this.transaksiService.getRiwayatPrabayar(memberId);
  }
}
