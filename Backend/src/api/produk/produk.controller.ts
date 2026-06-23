import { Controller, Get, Post, Query, Body, UseGuards, Req } from '@nestjs/common';
import { ProdukService } from './produk.service';
import { JwtApiGuard } from '../guards/jwt-api.guard';
import { GetProdukDto } from './dto/get-produk.dto';

@Controller('api/daftar-produk')
@UseGuards(JwtApiGuard)
export class ProdukController {
  constructor(private readonly produkService: ProdukService) {}

  @Get()
  async getDaftarProduk(@Query() query: GetProdukDto, @Req() req: any) {
    return await this.produkService.getDaftarProduk(query, req.user);
  }

  @Post()
  async getDaftarProdukPost(@Query() query: GetProdukDto, @Body() body: any, @Req() req: any) {
    // Merge query and body so it works for both GET and POST
    const mergedQuery = { ...query, ...body };
    return await this.produkService.getDaftarProduk(mergedQuery, req.user);
  }

  @Post('get-prefix')
  async getPrefix(@Body() body: any) {
    return await this.produkService.getPrefix(body);
  }
}
