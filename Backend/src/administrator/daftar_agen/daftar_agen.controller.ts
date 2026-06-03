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
import { DaftarAgenService } from './daftar_agen.service';
import { CreateAgenDto } from './dto/create-agen.dto';
import { UpdateAgenDto } from './dto/update-agen.dto';
import { GetAgenDto } from './dto/get-agen.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('administrator/agen')
@UseGuards(JwtAuthGuard)
export class DaftarAgenController {
  constructor(private readonly daftarAgenService: DaftarAgenService) {}

  @Get()
  async findAll(@Query() query: GetAgenDto) {
    const data = await this.daftarAgenService.findAll(query);
    return {
      message: 'Success',
      error: null,
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.daftarAgenService.findOne(+id);
    return {
      message: 'Success',
      error: null,
      data,
    };
  }

  @Post()
  async create(@Body() createAgenDto: CreateAgenDto) {
    const data = await this.daftarAgenService.create(createAgenDto);
    return {
      message: 'Agen berhasil ditambahkan',
      error: null,
      data,
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAgenDto: UpdateAgenDto,
  ) {
    const data = await this.daftarAgenService.update(+id, updateAgenDto);
    return {
      message: 'Data agen berhasil diperbarui',
      error: null,
      data,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.daftarAgenService.remove(+id);
    return {
      message: 'Agen berhasil dihapus',
      error: null,
      data: null,
    };
  }
}
