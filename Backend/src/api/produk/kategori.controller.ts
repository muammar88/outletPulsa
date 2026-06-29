import { Controller, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ProdukService } from './produk.service';
import { JwtApiGuard } from '../guards/jwt-api.guard';
import { DaftarKategoriDto } from './dto/daftar-kategori.dto';

@Controller('api/daftar-kategori')
@UseGuards(JwtApiGuard)
export class KategoriController {
  constructor(private readonly produkService: ProdukService) {}

  @Post()
  async getDaftarKategori(@Body() body: DaftarKategoriDto, @Query('search') search: string = '') {
    return await this.produkService.getDaftarKategori(body.kode, search);
  }
}
