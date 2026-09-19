import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put } from '@nestjs/common';
import { EmoneyLinkquService } from './emoney_linkqu.service';
import { CreateEmoneyLinkquDto } from './dto/create-emoney_linkqu.dto';
import { UpdateEmoneyLinkquDto } from './dto/update-emoney_linkqu.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('administrator/emoney-linkqu')
export class EmoneyLinkquController {
  constructor(private readonly emoneyLinkquService: EmoneyLinkquService) {}

  @Post()
  async create(@Body() createEmoneyLinkquDto: CreateEmoneyLinkquDto) {
    const data = await this.emoneyLinkquService.create(createEmoneyLinkquDto);
    return { statusCode: 200, message: 'Berhasil menambahkan E-Money LinkQu', data };
  }

  @Post('sync')
  async sync() {
    const result = await this.emoneyLinkquService.sync();
    return { statusCode: 200, message: result.message, data: result.data };
  }

  @Get()
  async findAll() {
    const data = await this.emoneyLinkquService.findAll();
    return { statusCode: 200, message: 'Berhasil mengambil daftar E-Money LinkQu', data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.emoneyLinkquService.findOne(+id);
    return { statusCode: 200, message: 'Berhasil mengambil data E-Money LinkQu', data };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateEmoneyLinkquDto: UpdateEmoneyLinkquDto) {
    const data = await this.emoneyLinkquService.update(+id, updateEmoneyLinkquDto);
    return { statusCode: 200, message: 'Berhasil memperbarui E-Money LinkQu', data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.emoneyLinkquService.remove(+id);
    return { statusCode: 200, message: 'Berhasil menghapus E-Money LinkQu' };
  }
}
