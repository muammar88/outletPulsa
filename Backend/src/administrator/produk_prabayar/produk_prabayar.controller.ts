import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ProdukPrabayarService } from './produk_prabayar.service';
import { CreateProdukPrabayarDto } from './dto/create-produk-prabayar.dto';
import { UpdateProdukPrabayarDto } from './dto/update-produk-prabayar.dto';
import { GetProdukPrabayarDto } from './dto/get-produk-prabayar.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('administrator/produk-prabayar')
export class ProdukPrabayarController {
  constructor(private readonly produkPrabayarService: ProdukPrabayarService) {}

  @Post()
  async create(@Body() createProdukPrabayarDto: CreateProdukPrabayarDto) {
    const data = await this.produkPrabayarService.create(createProdukPrabayarDto);
    return {
      success: true,
      message: 'Data berhasil disimpan',
      data,
    };
  }

  @Post('sync-termurah')
  async syncTermurah() {
    const data = await this.produkPrabayarService.syncTermurah();
    return {
      success: true,
      message: 'Sinkronisasi produk termurah berhasil diproses',
      data,
    };
  }

  @Post('bulk-update-status')
  async bulkUpdateStatus(@Body() payload: { ids: number[]; status: 'active' | 'inactive' }) {
    if (!payload.ids || !payload.ids.length) {
      return { success: false, message: 'Tidak ada produk yang dipilih' };
    }
    const data = await this.produkPrabayarService.bulkUpdateStatus(payload.ids, payload.status);
    return {
      success: true,
      message: `Proses bulk update status selesai`,
      data,
    };
  }

  @Get()
  async findAll(@Query() query: GetProdukPrabayarDto) {
    const data = await this.produkPrabayarService.findAll(query);
    return {
      success: true,
      message: 'Data berhasil diambil',
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.produkPrabayarService.findOne(+id);
    return {
      success: true,
      message: 'Data berhasil diambil',
      data,
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateProdukPrabayarDto: UpdateProdukPrabayarDto) {
    const data = await this.produkPrabayarService.update(+id, updateProdukPrabayarDto);
    return {
      success: true,
      message: 'Data berhasil diupdate',
      data,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.produkPrabayarService.remove(+id);
    return {
      success: true,
      message: 'Data berhasil dihapus',
      data: {},
    };
  }
}
