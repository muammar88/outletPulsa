import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { PengaturanUmumService } from './pengaturan_umum.service';
import { UpdatePengaturanUmumDto } from './dto/update-pengaturan-umum.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('api/administrator/pengaturan-umum')
export class PengaturanUmumController {
  constructor(private readonly pengaturanUmumService: PengaturanUmumService) {}

  @Get()
  getPengaturan() {
    return this.pengaturanUmumService.getPengaturan();
  }

  @Put()
  update(@Body() updatePengaturanUmumDto: UpdatePengaturanUmumDto) {
    return this.pengaturanUmumService.update(updatePengaturanUmumDto);
  }
}
