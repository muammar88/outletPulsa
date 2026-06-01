import { Module } from '@nestjs/common';
import { PengaturanUmumService } from './pengaturan_umum.service';
import { PengaturanUmumController } from './pengaturan_umum.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [PengaturanUmumController],
  providers: [PengaturanUmumService, PrismaService],
})
export class PengaturanUmumModule {}
