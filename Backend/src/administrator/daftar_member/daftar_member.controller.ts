import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { DaftarMemberService } from './daftar_member.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { GetMemberDto } from './dto/get-member.dto';
import { TambahSaldoDto } from './dto/tambah-saldo.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
// import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('administrator/member')
@UseGuards(JwtAuthGuard)
export class DaftarMemberController {
  constructor(private readonly daftarMemberService: DaftarMemberService) {}

  @Get()
  async findAll(@Query() query: GetMemberDto) {
    const data = await this.daftarMemberService.findAll(query);
    return {
      message: 'Success',
      error: null,
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.daftarMemberService.findOne(+id);
    return {
      message: 'Success',
      error: null,
      data,
    };
  }

  @Post()
  async create(@Body() createMemberDto: CreateMemberDto) {
    const data = await this.daftarMemberService.create(createMemberDto);
    return {
      message: 'Member berhasil ditambahkan',
      error: null,
      data,
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMemberDto: UpdateMemberDto,
  ) {
    const data = await this.daftarMemberService.update(+id, updateMemberDto);
    return {
      message: 'Data member berhasil diperbarui',
      error: null,
      data,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.daftarMemberService.remove(+id);
    return {
      message: 'Member berhasil dihapus',
      error: null,
      data: null,
    };
  }

  @Post('tambah-saldo')
  @HttpCode(200)
  async tambahSaldo(@Body() tambahSaldoDto: TambahSaldoDto) {
    return await this.daftarMemberService.tambahSaldo(tambahSaldoDto);
  }
}
