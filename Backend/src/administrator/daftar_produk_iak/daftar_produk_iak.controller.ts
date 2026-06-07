import { Controller, Get, Post, Query, UseGuards, Request } from '@nestjs/common';
import { DaftarProdukIakService } from './daftar_produk_iak.service';
import { GetProdukIakDto } from './dto/get-produk-iak.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('administrator/daftar-produk-iak')
@UseGuards(JwtAuthGuard)
export class DaftarProdukIakController {
  constructor(private readonly daftarProdukIakService: DaftarProdukIakService) {}

  @Post('sync')
  async sync(@Request() req: any) {
    // req.user from JwtAuthGuard usually contains userId
    const adminId = req.user?.id || 0;
    const data = await this.daftarProdukIakService.syncProducts(adminId);
    return {
      message: 'Sync produk IAK berhasil',
      error: null,
      data,
    };
  }

  @Get()
  async findAll(@Query() query: GetProdukIakDto) {
    const data = await this.daftarProdukIakService.findAll(query);
    return {
      message: 'Success',
      error: null,
      data,
    };
  }
}
