import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DaftarDeviceService } from './daftar_device.service';
import { GetDeviceDto } from './dto/get-device.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('administrator/device')
@UseGuards(JwtAuthGuard)
export class DaftarDeviceController {
  constructor(private readonly daftarDeviceService: DaftarDeviceService) {}

  @Get()
  async findAll(@Query() query: GetDeviceDto) {
    const data = await this.daftarDeviceService.findAll(query);
    return {
      success: true,
      message: 'Berhasil mengambil daftar device.',
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.daftarDeviceService.findOne(+id);
    return {
      success: true,
      message: 'Berhasil mengambil detail device.',
      data,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.daftarDeviceService.remove(+id);
    return {
      success: true,
      message: 'Berhasil menghapus device.',
      data,
    };
  }
}
