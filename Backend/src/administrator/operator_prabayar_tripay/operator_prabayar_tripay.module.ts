import { Module } from '@nestjs/common';
import { OperatorPrabayarTripayService } from './operator_prabayar_tripay.service';
import { OperatorPrabayarTripayController } from './operator_prabayar_tripay.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [OperatorPrabayarTripayController],
  providers: [OperatorPrabayarTripayService, PrismaService],
  exports: [OperatorPrabayarTripayService],
})
export class OperatorPrabayarTripayModule {}
