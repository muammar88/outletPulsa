import { Controller, Get, Post, UseGuards, Request, Body } from '@nestjs/common';
import { JwtApiGuard } from '../guards/jwt-api.guard';
import { DepositService } from './deposit.service';
import { DepositSaldoDto } from './dto/deposit-saldo.dto';
import { DepositLinkquDto } from './dto/deposit-linkqu.dto';

@Controller('api')
export class DepositController {
  constructor(private readonly depositService: DepositService) {}

  @UseGuards(JwtApiGuard)
  @Post('deposit-saldo')
  async depositSaldo(@Request() req: any, @Body() body: DepositSaldoDto) {
    const memberId = req.user?.id;

    console.log('_____________________');
    console.log(req.user);
    console.log(memberId);
    console.log('_____________________');
    
    return this.depositService.depositSaldo(memberId, body);
  }

  @UseGuards(JwtApiGuard)
  @Get('deposit-info')
  async infoDeposit(@Request() req: any) {
    const memberId = req.user?.id;
    return this.depositService.getDepositInfo(memberId);
  }

  @UseGuards(JwtApiGuard)
  @Get('deposit-info-konfirmasi')
  async infoKonfirmasiDeposit(@Request() req: any) {
    const memberId = req.user?.id;
    return this.depositService.getDepositInfoKonfirmasi(memberId);
  }

  @UseGuards(JwtApiGuard)
  @Get('deposit-linkqu/payment-methods')
  async getLinkquPaymentMethods(@Request() req: any) {
    const memberId = req.user?.id;
    return this.depositService.getLinkquPaymentMethods();
  }

  @UseGuards(JwtApiGuard)
  @Post('deposit-linkqu/process')
  async processLinkquDeposit(@Request() req: any, @Body() body: DepositLinkquDto) {
    const memberId = req.user?.id;
    return this.depositService.processLinkquDeposit(memberId, body);
  }
}
