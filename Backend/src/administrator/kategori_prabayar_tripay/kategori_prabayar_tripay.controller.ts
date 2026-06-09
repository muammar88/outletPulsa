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
import { KategoriPrabayarTripayService } from './kategori_prabayar_tripay.service';
import { GetKategoriPrabayarTripayDto } from './dto/get-kategori-prabayar-tripay.dto';
import { CreateKategoriPrabayarTripayDto } from './dto/create-kategori-prabayar-tripay.dto';
import { UpdateKategoriPrabayarTripayDto } from './dto/update-kategori-prabayar-tripay.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('administrator/kategori-prabayar-tripay')
@UseGuards(JwtAuthGuard)
export class KategoriPrabayarTripayController {
  constructor(private readonly kategoriPrabayarTripayService: KategoriPrabayarTripayService) {}

  @Get()
  async findAll(@Query() query: GetKategoriPrabayarTripayDto) {
    const data = await this.kategoriPrabayarTripayService.findAll(query);
    return {
      message: 'Success',
      error: null,
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.kategoriPrabayarTripayService.findOne(+id);
    return {
      message: 'Success',
      error: null,
      data,
    };
  }

  @Post()
  async create(@Body() dto: CreateKategoriPrabayarTripayDto, @Req() req: any) {
    const data = await this.kategoriPrabayarTripayService.create(dto, req.user.id);
    return {
      message: 'Kategori Prabayar Tripay berhasil ditambahkan',
      error: null,
      data,
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateKategoriPrabayarTripayDto,
    @Req() req: any,
  ) {
    const data = await this.kategoriPrabayarTripayService.update(+id, dto, req.user.id);
    return {
      message: 'Kategori Prabayar Tripay berhasil diperbarui',
      error: null,
      data,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const result = await this.kategoriPrabayarTripayService.remove(+id, req.user.id);
    return {
      message: result.message,
      error: null,
      data: null,
    };
  }
}
