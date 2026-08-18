import { Controller, Get, Post, Query, UseGuards, Param, Body } from '@nestjs/common';
import { DaftarProdukDigiflazzService } from './daftar_produk_digiflazz.service';
import { GetDigiflazzProductDto } from './dto/get-digiflazz-product.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('administrator/daftar-produk-digiflazz')
@UseGuards(JwtAuthGuard)
export class DaftarProdukDigiflazzController {
  constructor(private readonly service: DaftarProdukDigiflazzService) {}

  @Get()
  async findAll(@Query() query: GetDigiflazzProductDto) {
    const data = await this.service.findAll(query);
    return {
      message: 'Success',
      error: null,
      data,
    };
  }

  @Get('filters')
  async getFilters() {
    const data = await this.service.getFilters();
    return {
      message: 'Success',
      error: null,
      data,
    };
  }

  @Post('select-cheapest-seller')
  async selectCheapestSeller() {
    const data = await this.service.selectCheapestSeller();
    return {
      message: `Pemilihan produk seller termurah berhasil. Diproses: ${data.totalProcessed}, Diperbarui: ${data.totalUpdated}, Lewati (tidak valid): ${data.totalSkipped}.`,
      error: null,
      data,
    };
  }

  @Get('internal-operators')
  async getInternalOperators(@Query('search') search: string) {
    const data = await this.service.getInternalOperators(search);
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
    const data = await this.service.getInternalProducts(+operatorId, search);
    return {
      message: 'Success',
      error: null,
      data,
    };
  }

  @Post(':id/connect')
  async connectProduct(
    @Param('id') id: string,
    @Body('produkId') produkId: number,
  ) {
    const data = await this.service.connectProduct(+id, produkId);
    return {
      message: 'Koneksi produk berhasil disimpan',
      error: null,
      data,
    };
  }

  @Get(':id/sellers')
  async getConnectedSellers(@Param('id') id: string) {
    const data = await this.service.getConnectedSellers(+id);
    return {
      message: 'Success',
      error: null,
      data,
    };
  }

  @Post(':id/toggle-status')
  async toggleStatus(@Param('id') id: string) {
    const data = await this.service.toggleStatus(+id);
    return {
      message: 'Status produk berhasil diperbarui',
      error: null,
      data,
    };
  }

  @Post(':id/select-seller')
  async selectSellerManual(
    @Param('id') id: string,
    @Body('sellerProductId') sellerProductId: number,
  ) {
    if (!sellerProductId) throw new Error('sellerProductId is required');
    const data = await this.service.selectSellerManual(+id, sellerProductId);
    return {
      message: 'Seller berhasil dipilih secara manual',
      error: null,
      data,
    };
  }
}
