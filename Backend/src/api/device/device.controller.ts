import { Controller, Post, Body, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { DeviceService } from './device.service';
import { RegisterDeviceDto, ValidateDeviceDto } from './dto/device.dto';

@Controller('api/device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDeviceDto) {
    return this.deviceService.register(dto);
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  async validate(@Body() dto: ValidateDeviceDto) {
    return this.deviceService.validate(dto);
  }

  @Get(':deviceCode')
  async getDevice(@Param('deviceCode') deviceCode: string) {
    return this.deviceService.getDevice(deviceCode);
  }
}
