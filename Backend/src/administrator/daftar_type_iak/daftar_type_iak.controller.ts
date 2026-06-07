import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DaftarTypeIakService } from './daftar_type_iak.service';
import { GetTypeIakDto } from './dto/get-type-iak.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('administrator/daftar-type-iak')
@UseGuards(JwtAuthGuard)
export class DaftarTypeIakController {
  constructor(private readonly daftarTypeIakService: DaftarTypeIakService) {}

  @Get()
  async findAll(@Query() query: GetTypeIakDto) {
    const data = await this.daftarTypeIakService.findAll(query);
    return {
      message: 'Success',
      error: null,
      data,
    };
  }
}
