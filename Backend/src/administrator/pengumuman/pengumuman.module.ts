import { Module } from '@nestjs/common';
import { PengumumanController } from './pengumuman.controller';
import { AdminPengumumanService } from './pengumuman.service';
import { PrismaService } from 'src/prisma.service';
import { PengumumanModule } from 'src/pengumuman/pengumuman.module';

@Module({
  imports: [PengumumanModule],
  controllers: [PengumumanController],
  providers: [AdminPengumumanService, PrismaService],
})
export class AdminPengumumanModule {}
