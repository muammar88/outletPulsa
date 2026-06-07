import { Module } from '@nestjs/common';
import { DaftarOperatorIakService } from './daftar_operator_iak.service';
import { DaftarOperatorIakController } from './daftar_operator_iak.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [DaftarOperatorIakController],
  providers: [DaftarOperatorIakService, PrismaService],
})
export class DaftarOperatorIakModule {}
