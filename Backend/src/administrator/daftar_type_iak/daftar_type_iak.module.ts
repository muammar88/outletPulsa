import { Module } from '@nestjs/common';
import { DaftarTypeIakService } from './daftar_type_iak.service';
import { DaftarTypeIakController } from './daftar_type_iak.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [DaftarTypeIakController],
  providers: [DaftarTypeIakService, PrismaService],
})
export class DaftarTypeIakModule {}
