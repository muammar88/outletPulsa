import { Controller, Get, Param, Query, UseGuards, Req } from '@nestjs/common';
import { RiwayatTransferSaldoService } from './riwayat_transfer_saldo.service';
import { GetRiwayatDto } from './dto/get-riwayat.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('administrator/riwayat-transfer-saldo')
@UseGuards(JwtAuthGuard)
export class RiwayatTransferSaldoController {
  constructor(private readonly riwayatService: RiwayatTransferSaldoService) {}

  @Get()
  async findAll(@Query() query: GetRiwayatDto) {
    const result = await this.riwayatService.findAll(query);
    return {
      message: 'Success',
      error: null,
      data: {
        data: result.data,
        meta: result.meta,
      },
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    if (isNaN(+id)) {
      throw new Error(`Invalid ID parameter: ${id}`);
    }
    const data = await this.riwayatService.findOne(+id);
    if (!data) {
      throw new Error(`Riwayat transfer saldo dengan ID ${id} tidak ditemukan`);
    }
    return {
      message: 'Success',
      error: null,
      data,
    };
  }
}
