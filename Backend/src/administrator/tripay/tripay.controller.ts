import { Controller, Get, Post, Body, Headers, Req, Query, UseGuards } from '@nestjs/common';
import { TripayService } from './tripay.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { Request } from 'express';

@Controller('tripay')
export class TripayController {
  constructor(private readonly tripayService: TripayService) {}

  @UseGuards(JwtAuthGuard)
  @Get('channels')
  async getChannels() {
    const channels = await this.tripayService.getPaymentChannels();
    return {
      statusCode: 200,
      message: 'Berhasil mengambil payment channels',
      data: channels
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('fee')
  async calculateFee(@Query('amount') amount: string, @Query('code') code: string) {
    const fee = await this.tripayService.calculateFee(Number(amount), code);
    return {
      statusCode: 200,
      message: 'Berhasil mengkalkulasi fee',
      data: fee
    };
  }

  // Webhook for Tripay Callback
  @Post('callback')
  async handleCallback(@Body() body: any, @Req() req: Request) {
    const signature = req.headers['x-callback-signature'] as string;
    const result = await this.tripayService.handleCallback(body, signature);
    return result;
  }
}
