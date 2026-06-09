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
import { KategoriPascabayarTripayService } from './kategori_pascabayar_tripay.service';
import { GetKategoriPascabayarTripayDto } from './dto/get-kategori-pascabayar-tripay.dto';
import { CreateKategoriPascabayarTripayDto } from './dto/create-kategori-pascabayar-tripay.dto';
import { UpdateKategoriPascabayarTripayDto } from './dto/update-kategori-pascabayar-tripay.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('administrator/kategori-pascabayar-tripay')
@UseGuards(JwtAuthGuard)
export class KategoriPascabayarTripayController {
  constructor(private readonly kategoriPascabayarTripayService: KategoriPascabayarTripayService) {}

  @Get()
  async findAll(@Query() query: GetKategoriPascabayarTripayDto) {
    const data = await this.kategoriPascabayarTripayService.findAll(query);
    return {
      message: 'Success',
      error: null,
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.kategoriPascabayarTripayService.findOne(+id);
    return {
      message: 'Success',
      error: null,
      data,
    };
  }

  @Post()
  async create(@Body() dto: CreateKategoriPascabayarTripayDto, @Req() req: any) {
    const data = await this.kategoriPascabayarTripayService.create(dto, req.user.id);
    return {
      message: 'Kategori Pascabayar Tripay berhasil ditambahkan',
      error: null,
      data,
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateKategoriPascabayarTripayDto,
    @Req() req: any,
  ) {
    const data = await this.kategoriPascabayarTripayService.update(+id, dto, req.user.id);
    return {
      message: 'Kategori Pascabayar Tripay berhasil diperbarui',
      error: null,
      data,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const result = await this.kategoriPascabayarTripayService.remove(+id, req.user.id);
    return {
      message: result.message,
      error: null,
      data: null,
    };
  }
}
