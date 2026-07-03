import { Module } from '@nestjs/common';
import { LaporanUmumController } from './laporan_umum.controller';
import { LaporanUmumService } from './laporan_umum.service';

@Module({
  controllers: [LaporanUmumController],
  providers: [LaporanUmumService],
})
export class LaporanUmumModule {}
