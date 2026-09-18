import { Controller, Get, Delete, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { GetRegistrationDto } from './dto/get-registration.dto';
import { AdminAuthGuard } from '../../auth/guards/admin.guard';
import { ResponseData } from 'src/common/interfaces/response.interface';
import { Temp_registrasi } from '@prisma/client';

@Controller('administrator/registration')
@UseGuards(AdminAuthGuard)
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Get()
  async findAll(@Query() query: GetRegistrationDto): Promise<ResponseData<any>> {
    const data = await this.registrationService.findAll(query);
    return {
      status: true,
      message: 'Berhasil mengambil data registrasi',
      data,
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<ResponseData<Temp_registrasi>> {
    const data = await this.registrationService.remove(id);
    return {
      status: true,
      message: 'Berhasil menghapus data registrasi',
      data,
    };
  }
}
