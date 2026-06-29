import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AdminPengumumanService } from './pengumuman.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('administrator/pengumuman')
@UseGuards(JwtAuthGuard)
export class PengumumanController {
  constructor(private readonly pengumumanService: AdminPengumumanService) {}

  @Get()
  async getAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search: string = '',
    @Query('status') status: string = '',
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('sortDesc') sortDesc: string = 'true',
  ) {
    return {
      status: true,
      message: 'Berhasil mengambil daftar pengumuman',
      data: await this.pengumumanService.getAll(
        parseInt(page),
        parseInt(limit),
        search,
        status,
        sortBy,
        sortDesc === 'true',
      ),
    };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return {
      status: true,
      message: 'Berhasil mengambil detail pengumuman',
      data: await this.pengumumanService.getById(parseInt(id)),
    };
  }

  @Post()
  async create(@Body() body: any, @Request() req: any) {
    const adminId = req.user.id;
    return {
      status: true,
      message: 'Berhasil menambahkan pengumuman',
      data: await this.pengumumanService.create(body, adminId),
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return {
      status: true,
      message: 'Berhasil memperbarui pengumuman',
      data: await this.pengumumanService.update(parseInt(id), body),
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return {
      status: true,
      message: 'Berhasil menghapus pengumuman',
      data: await this.pengumumanService.delete(parseInt(id)),
    };
  }

  @Post(':id/publish')
  async publish(@Param('id') id: string, @Request() req: any) {
    const adminId = req.user.id;
    return {
      status: true,
      message: 'Berhasil memulai proses publikasi pengumuman',
      data: await this.pengumumanService.publish(parseInt(id), adminId),
    };
  }
}
