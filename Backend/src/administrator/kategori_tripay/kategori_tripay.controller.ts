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
  Req,
} from '@nestjs/common';
import { KategoriTripayService } from './kategori_tripay.service';
import { GetKategoriTripayDto } from './dto/get-kategori-tripay.dto';
import { CreateKategoriTripayDto } from './dto/create-kategori-tripay.dto';
import { UpdateKategoriTripayDto } from './dto/update-kategori-tripay.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('administrator/kategori-tripay')
@UseGuards(JwtAuthGuard)
export class KategoriTripayController {
  constructor(private readonly kategoriTripayService: KategoriTripayService) {}

  @Get()
  async findAll(@Query() query: GetKategoriTripayDto) {
    const data = await this.kategoriTripayService.findAll(query);
    return {
      message: 'Success',
      error: null,
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.kategoriTripayService.findOne(+id);
    return {
      message: 'Success',
      error: null,
      data,
    };
  }

  @Post()
  async create(@Body() dto: CreateKategoriTripayDto, @Req() req: any) {
    const data = await this.kategoriTripayService.create(dto, req.user.id);
    return {
      message: 'Kategori Tripay berhasil ditambahkan',
      error: null,
      data,
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateKategoriTripayDto,
    @Req() req: any,
  ) {
    const data = await this.kategoriTripayService.update(+id, dto, req.user.id);
    return {
      message: 'Kategori Tripay berhasil diperbarui',
      error: null,
      data,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const result = await this.kategoriTripayService.remove(+id, req.user.id);
    return {
      message: result.message,
      error: null,
      data: null,
    };
  }
}
