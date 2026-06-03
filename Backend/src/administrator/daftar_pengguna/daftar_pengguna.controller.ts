import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { DaftarPenggunaService } from './daftar_pengguna.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('administrator/daftar-pengguna')
@UseGuards(JwtAuthGuard)
export class DaftarPenggunaController {
  constructor(private readonly daftarPenggunaService: DaftarPenggunaService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto, @Request() req) {
    const adminId = req.user.id;
    const data = await this.daftarPenggunaService.create(createUserDto, adminId);
    return { message: 'Berhasil menambahkan pengguna', error: null, data };
  }

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search: string = '',
  ) {
    const data = await this.daftarPenggunaService.findAll(+page, +limit, search);
    return { message: 'Berhasil mengambil daftar pengguna', error: null, data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.daftarPenggunaService.findOne(+id);
    return { message: 'Berhasil mengambil detail pengguna', error: null, data };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req
  ) {
    const adminId = req.user.id;
    const data = await this.daftarPenggunaService.update(+id, updateUserDto, adminId);
    return { message: 'Berhasil mengubah pengguna', error: null, data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const adminId = req.user.id;
    const data = await this.daftarPenggunaService.remove(+id, adminId);
    return { message: 'Berhasil menghapus pengguna', error: null, data };
  }
}
