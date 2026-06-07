import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DaftarOperatorIakService } from './daftar_operator_iak.service';
import { GetOperatorIakDto } from './dto/get-operator-iak.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('administrator/daftar-operator-iak')
@UseGuards(JwtAuthGuard)
export class DaftarOperatorIakController {
  constructor(private readonly daftarOperatorIakService: DaftarOperatorIakService) {}

  @Get()
  async findAll(@Query() query: GetOperatorIakDto) {
    const data = await this.daftarOperatorIakService.findAll(query);
    return {
      message: 'Success',
      error: null,
      data,
    };
  }
}
