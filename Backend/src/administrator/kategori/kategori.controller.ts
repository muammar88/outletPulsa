import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { KategoriService } from './kategori.service';
import { CreateKategoriDto } from './dto/create-kategori.dto';
import { UpdateKategoriDto } from './dto/update-kategori.dto';
import { GetKategoriDto } from './dto/get-kategori.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('administrator/kategori')
@UseGuards(JwtAuthGuard)
export class KategoriController {
  constructor(private readonly kategoriService: KategoriService) {}

  @Get()
  async findAll(@Query() query: GetKategoriDto) {
    const data = await this.kategoriService.findAll(query);
    return { message: 'Success', error: null, data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.kategoriService.findOne(+id);
    return { message: 'Success', error: null, data };
  }

  @Post()
  async create(@Body() createKategoriDto: CreateKategoriDto) {
    const data = await this.kategoriService.create(createKategoriDto);
    return { message: 'Kategori berhasil ditambahkan', error: null, data };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateKategoriDto: UpdateKategoriDto) {
    const data = await this.kategoriService.update(+id, updateKategoriDto);
    return { message: 'Data kategori berhasil diperbarui', error: null, data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.kategoriService.remove(+id);
    return { message: 'Kategori berhasil dihapus', error: null, data: null };
  }
}
