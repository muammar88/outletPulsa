import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('administrator/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('statistics')
  async getStatistics() {
    const data = await this.dashboardService.getStatistics();
    return {
      statusCode: 200,
      message: 'Berhasil mengambil statistik dashboard',
      data,
    };
  }

  @Get('recent-transactions')
  async getRecentTransactions() {
    const data = await this.dashboardService.getRecentTransactions();
    return {
      statusCode: 200,
      message: 'Berhasil mengambil transaksi terbaru',
      data,
    };
  }

  @Get('top-products')
  async getTopProducts() {
    const data = await this.dashboardService.getTopProducts();
    return {
      statusCode: 200,
      message: 'Berhasil mengambil produk terlaris',
      data,
    };
  }

  @Get('system-status')
  async getSystemStatus() {
    const data = await this.dashboardService.getSystemStatus();
    return {
      statusCode: 200,
      message: 'Berhasil mengambil status sistem',
      data,
    };
  }
}
