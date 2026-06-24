import { Module } from '@nestjs/common';
import { LabaDiambilService } from './laba_diambil.service';
import { LabaDiambilController } from './laba_diambil.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [LabaDiambilController],
  providers: [LabaDiambilService, PrismaService],
})
export class LabaDiambilModule {}
