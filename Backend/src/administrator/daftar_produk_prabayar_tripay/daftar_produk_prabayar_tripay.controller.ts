import { Controller, Get, Post, Param, Query, UseGuards, Req, Body } from '@nestjs/common';
import { DaftarProdukPrabayarTripayService } from './daftar_produk_prabayar_tripay.service';
import { GetTripayProductDto } from './dto/get-tripay-product.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('administrator/daftar-produk-prabayar-tripay')
@UseGuards(JwtAuthGuard)
export class DaftarProdukPrabayarTripayController {
  constructor(private readonly daftarProdukTripayService: DaftarProdukPrabayarTripayService) {}

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

  @Get('internal-operators')
  async getInternalOperators(@Query('search') search: string) {
    const data = await this.daftarProdukTripayService.getInternalOperators(search);
    return {
      message: 'Success',
      error: null,
      data,
    };
  }

  @Get('internal-products')
  async getInternalProducts(
    @Query('operatorId') operatorId: string,
    @Query('search') search: string
  ) {
    if (!operatorId) throw new Error('operatorId is required');
    const data = await this.daftarProdukTripayService.getInternalProducts(+operatorId, search);
    return {
      message: 'Success',
      error: null,
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    if (isNaN(+id)) {
      throw new Error(`Invalid ID parameter: ${id}`);
    }
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

  @Post(':id/connect')
  async connectProduct(
    @Param('id') id: string,
    @Body('produkId') produkId: number,
  ) {
    const data = await this.daftarProdukTripayService.connectProduct(+id, produkId);
    return {
      message: 'Koneksi produk berhasil disimpan',
      error: null,
      data,
    };
  }

  @Post(':id/toggle-status')
  async toggleStatus(@Param('id') id: string) {
    const data = await this.daftarProdukTripayService.toggleStatus(+id);
    return {
      message: 'Status produk prabayar Tripay berhasil diperbarui',
      error: null,
      data,
    };
  }
}
