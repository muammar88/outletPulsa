import { Module } from '@nestjs/common';
import { PengumumanService } from './pengumuman.service';
import { PengumumanController } from './pengumuman.controller';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [PengumumanService, PrismaService],
  controllers: [PengumumanController],
  exports: [PengumumanService]
})
export class PengumumanModule {}
