import { Module } from '@nestjs/common';
import { OperatorTripayService } from './operator_tripay.service';
import { OperatorTripayController } from './operator_tripay.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [OperatorTripayController],
  providers: [OperatorTripayService, PrismaService],
  exports: [OperatorTripayService],
})
export class OperatorTripayModule {}
