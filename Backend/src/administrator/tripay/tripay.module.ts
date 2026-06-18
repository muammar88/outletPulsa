import { Module } from '@nestjs/common';
import { TripayController } from './tripay.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [TripayController],
  providers: [PrismaService],
  exports: []
})
export class TripayModule {}
