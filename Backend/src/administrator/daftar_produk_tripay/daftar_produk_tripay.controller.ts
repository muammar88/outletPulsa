import { Controller, Get, Post, Param, Query, UseGuards, Req } from '@nestjs/common';
import { DaftarProdukTripayService } from './daftar_produk_tripay.service';
import { GetTripayProductDto } from './dto/get-tripay-product.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('administrator/daftar-produk-tripay')
@UseGuards(JwtAuthGuard)
export class DaftarProdukTripayController {
  constructor(private readonly daftarProdukTripayService: DaftarProdukTripayService) {}

  @Get()
  async findAll(@Query() query: GetTripayProductDto, @Req() req: any) {
    const adminId = req.user.id;
    const data = await this.daftarProdukTripayService.findAll(query, adminId);
    return {
      message: 'Success',
      error: null,
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    const adminId = req.user.id;
    const data = await this.daftarProdukTripayService.findOne(+id, adminId);
    return {
      message: 'Success',
      error: null,
      data,
    };
  }

  @Post('sync')
  async syncProducts(@Req() req: any) {
    const adminId = req.user.id;
    const data = await this.daftarProdukTripayService.syncProducts(adminId);
    return {
      message: 'Sinkronisasi berhasil dimulai',
      error: null,
      data,
    };
  }
}
