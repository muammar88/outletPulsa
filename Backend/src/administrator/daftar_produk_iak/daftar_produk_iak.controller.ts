import { Controller, Get, Post, Query, UseGuards, Request, Param, Body } from '@nestjs/common';
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

  @Get('internal-operators')
  async getInternalOperators(@Query('search') search: string) {
    const data = await this.daftarProdukIakService.getInternalOperators(search);
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
    const data = await this.daftarProdukIakService.getInternalProducts(+operatorId, search);
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
    const data = await this.daftarProdukIakService.connectProduct(+id, produkId);
    return {
      message: 'Koneksi produk berhasil disimpan',
      error: null,
      data,
    };
  }
}
