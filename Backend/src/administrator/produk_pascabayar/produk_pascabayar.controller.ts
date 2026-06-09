import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ProdukPascabayarService } from './produk_pascabayar.service';
import { CreateProdukPascabayarDto } from './dto/create-produk-pascabayar.dto';
import { UpdateProdukPascabayarDto } from './dto/update-produk-pascabayar.dto';
import { GetProdukPascabayarDto } from './dto/get-produk-pascabayar.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('administrator/produk-pascabayar')
export class ProdukPascabayarController {
  constructor(private readonly produkPascabayarService: ProdukPascabayarService) {}

  @Post()
  async create(@Body() createProdukPascabayarDto: CreateProdukPascabayarDto) {
    const data = await this.produkPascabayarService.create(createProdukPascabayarDto);
    return {
      success: true,
      message: 'Data berhasil disimpan',
      data,
    };
  }

  @Get()
  async findAll(@Query() query: GetProdukPascabayarDto) {
    const data = await this.produkPascabayarService.findAll(query);
    return {
      success: true,
      message: 'Data berhasil diambil',
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.produkPascabayarService.findOne(+id);
    return {
      success: true,
      message: 'Data berhasil diambil',
      data,
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateProdukPascabayarDto: UpdateProdukPascabayarDto) {
    const data = await this.produkPascabayarService.update(+id, updateProdukPascabayarDto);
    return {
      success: true,
      message: 'Data berhasil diupdate',
      data,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.produkPascabayarService.remove(+id);
    return {
      success: true,
      message: 'Data berhasil dihapus',
      data: {},
    };
  }
}