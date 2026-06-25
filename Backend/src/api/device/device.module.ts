import { Module } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceController } from './device.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  providers: [DeviceService, PrismaService],
  controllers: [DeviceController],
  exports: [DeviceService],
})
export class DeviceModule {}
