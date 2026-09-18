import { Controller, Get, Delete, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { GetRegistrationDto } from './dto/get-registration.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Temp_registrasi } from '@prisma/client';

@Controller('administrator/registration')
@UseGuards(JwtAuthGuard)
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Get()
  async findAll(@Query() query: GetRegistrationDto) {
    const data = await this.registrationService.findAll(query);
    return {
      status: true,
      message: 'Berhasil mengambil data registrasi',
      data,
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const data = await this.registrationService.remove(id);
    return {
      status: true,
      message: 'Berhasil menghapus data registrasi',
      data,
    };
  }
}
