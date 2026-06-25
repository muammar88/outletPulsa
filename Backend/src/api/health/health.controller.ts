import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Controller('api/health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async checkHealth() {
    try {
      // Pengecekan koneksi database sederhana
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: 'Database connection failed',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
