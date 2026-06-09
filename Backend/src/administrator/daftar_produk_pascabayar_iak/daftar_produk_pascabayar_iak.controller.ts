import { Controller, Get, Post, Query, UseGuards, Request, Param, Body } from '@nestjs/common';
import { DaftarProdukPascabayarIakService } from './daftar_produk_pascabayar_iak.service';
import { GetProdukIakDto } from './dto/get-produk-iak.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('administrator/daftar-produk-pascabayar-iak')
@UseGuards(JwtAuthGuard)
export class DaftarProdukPascabayarIakController {
  constructor(private readonly DaftarProdukPascabayarIakService: DaftarProdukPascabayarIakService) {}

  @Post('sync')
  async sync(@Request() req: any) {
    // req.user from JwtAuthGuard usually contains userId
    const adminId = req.user?.id || 0;
    const data = await this.DaftarProdukPascabayarIakService.syncProducts(adminId);
    return {
      message: 'Sync produk IAK berhasil',
      error: null,
      data,
    };
  }

  @Get()
  async findAll(@Query() query: GetProdukIakDto) {
    const data = await this.DaftarProdukPascabayarIakService.findAll(query);
    return {
      message: 'Success',
      error: null,
      data,
    };
  }

  @Get('types')
  async getTypes() {
    const data = await this.DaftarProdukPascabayarIakService.getTypes();
    return {
      message: 'Success',
      error: null,
      data,
    };
  }

  @Get('internal-products')
  async getInternalProducts(
    @Query('search') search: string
  ) {
    const data = await this.DaftarProdukPascabayarIakService.getInternalProducts(search);
    return {
      message: 'Success',
      error: null,
      data,
    };
  }

  @Post(':id/connect')
  async connectProduct(
    @Param('id') id: string,
    @Body('produkPascabayarId') produkPascabayarId: number,
  ) {
    const data = await this.DaftarProdukPascabayarIakService.connectProduct(+id, produkPascabayarId);
    return {
      message: 'Koneksi produk berhasil disimpan',
      error: null,
      data,
    };
  }
}
