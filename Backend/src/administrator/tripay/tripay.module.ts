import { Module } from '@nestjs/common';
import { TripayService } from './tripay.service';
import { TripayController } from './tripay.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [TripayController],
  providers: [TripayService, PrismaService],
  exports: [TripayService]
})
export class TripayModule {}
