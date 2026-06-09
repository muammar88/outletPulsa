import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DaftarSellerDigiflazzService } from './daftar_seller_digiflazz.service';
import { GetSellerDigiflazzDto } from './dto/get-seller-digiflazz.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('administrator/daftar-seller-digiflazz')
@UseGuards(JwtAuthGuard)
export class DaftarSellerDigiflazzController {
  constructor(private readonly service: DaftarSellerDigiflazzService) {}

  @Get()
  async findAll(@Query() query: GetSellerDigiflazzDto) {
    const data = await this.service.findAll(query);
    return {
      message: 'Success',
      error: null,
      data,
    };
  }
}
