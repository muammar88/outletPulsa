import { Module } from '@nestjs/common';
import { OperatorPascabayarTripayService } from './operator_pascabayar_tripay.service';
import { OperatorPascabayarTripayController } from './operator_pascabayar_tripay.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [OperatorPascabayarTripayController],
  providers: [OperatorPascabayarTripayService, PrismaService],
  exports: [OperatorPascabayarTripayService],
})
export class OperatorPascabayarTripayModule {}
