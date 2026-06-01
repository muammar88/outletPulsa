import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { SemuaProdukService } from './semua_produk.service';
import { CreateSemuaProdukDto } from './dto/create-semua-produk.dto';
import { UpdateSemuaProdukDto } from './dto/update-semua-produk.dto';
import { GetSemuaProdukDto } from './dto/get-semua-produk.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('administrator/semua-produk')
export class SemuaProdukController {
  constructor(private readonly semuaProdukService: SemuaProdukService) {}

  @Post()
  async create(@Body() createSemuaProdukDto: CreateSemuaProdukDto) {
    const data = await this.semuaProdukService.create(createSemuaProdukDto);
    return {
      success: true,
      message: 'Data berhasil disimpan',
      data,
    };
  }

  @Get()
  async findAll(@Query() query: GetSemuaProdukDto) {
    const data = await this.semuaProdukService.findAll(query);
    return {
      success: true,
      message: 'Data berhasil diambil',
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.semuaProdukService.findOne(+id);
    return {
      success: true,
      message: 'Data berhasil diambil',
      data,
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateSemuaProdukDto: UpdateSemuaProdukDto) {
    const data = await this.semuaProdukService.update(+id, updateSemuaProdukDto);
    return {
      success: true,
      message: 'Data berhasil diupdate',
      data,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.semuaProdukService.remove(+id);
    return {
      success: true,
      message: 'Data berhasil dihapus',
      data: {},
    };
  }
}
