import { Controller, Get, Query, UseGuards, Post, Request } from '@nestjs/common';
import { DaftarProdukSellerDigiflazzService } from './daftar_produk_seller_digiflazz.service';
import { GetProdukSellerDigiflazzDto } from './dto/get-produk-seller-digiflazz.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('administrator/daftar-produk-seller-digiflazz')
@UseGuards(JwtAuthGuard)
export class DaftarProdukSellerDigiflazzController {
  constructor(private readonly service: DaftarProdukSellerDigiflazzService) {}

  @Post('sync')
  async sync(@Request() req: any) {
    const adminId = req.user?.id || 0;
    const data = await this.service.syncProducts(adminId);
    return {
      message: 'Sync produk Digiflazz berhasil',
      error: null,
      data,
    };
  }

  @Get()
  async findAll(@Query() query: GetProdukSellerDigiflazzDto) {
    const data = await this.service.findAll(query);
    return {
      message: 'Success',
      error: null,
      data,
    };
  }

  @Get('sellers')
  async getSellers() {
    const data = await this.service.getSellers();
    return {
      message: 'Success',
      error: null,
      data,
    };
  }
}
