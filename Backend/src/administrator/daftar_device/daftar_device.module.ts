import { Module } from '@nestjs/common';
import { DaftarDeviceService } from './daftar_device.service';
import { DaftarDeviceController } from './daftar_device.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [DaftarDeviceController],
  providers: [DaftarDeviceService, PrismaService],
})
export class DaftarDeviceModule {}
