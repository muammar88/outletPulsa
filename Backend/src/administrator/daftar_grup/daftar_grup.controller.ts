import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { DaftarGrupService } from './daftar_grup.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AssignPermissionDto } from './dto/assign-permission.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('administrator/daftar-grup')
@UseGuards(JwtAuthGuard)
export class DaftarGrupController {
  constructor(private readonly daftarGrupService: DaftarGrupService) {}

  @Post()
  async create(@Body() createGroupDto: CreateGroupDto, @Request() req) {
    const adminId = req.user.id;
    const data = await this.daftarGrupService.create(createGroupDto, adminId);
    return { message: 'Berhasil menambahkan grup', error: null, data };
  }

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search: string = '',
  ) {
    const data = await this.daftarGrupService.findAll(+page, +limit, search);
    return { message: 'Berhasil mengambil daftar grup', error: null, data };
  }

  @Get('permissions')
  async getPermissions() {
    const data = await this.daftarGrupService.getPermissions();
    return { message: 'Berhasil mengambil daftar permissions', error: null, data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.daftarGrupService.findOne(+id);
    return { message: 'Berhasil mengambil detail grup', error: null, data };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
    @Request() req
  ) {
    const adminId = req.user.id;
    const data = await this.daftarGrupService.update(+id, updateGroupDto, adminId);
    return { message: 'Berhasil mengubah grup', error: null, data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const adminId = req.user.id;
    const data = await this.daftarGrupService.remove(+id, adminId);
    return { message: 'Berhasil menghapus grup', error: null, data };
  }

  @Post(':id/permissions')
  async assignPermissions(
    @Param('id') id: string,
    @Body() dto: AssignPermissionDto,
    @Request() req
  ) {
    const adminId = req.user.id;
    const data = await this.daftarGrupService.assignPermissions(+id, dto, adminId);
    return { message: 'Berhasil memperbarui hak akses', error: null, data };
  }
}
