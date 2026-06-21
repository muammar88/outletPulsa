import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtApiGuard } from '../guards/jwt-api.guard';
import { DepositService } from './deposit.service';

@Controller('api')
export class DepositController {
  constructor(private readonly depositService: DepositService) {}

  @UseGuards(JwtApiGuard)
  @Get('deposit-info')
  async infoDeposit(@Request() req: any) {
    const memberId = req.user?.memberId;
    return this.depositService.getDepositInfo(memberId);
  }

  @UseGuards(JwtApiGuard)
  @Get('deposit-info-konfirmasi')
  async infoKonfirmasiDeposit(@Request() req: any) {
    const memberId = req.user?.memberId;
    return this.depositService.getDepositInfoKonfirmasi(memberId);
  }
}
