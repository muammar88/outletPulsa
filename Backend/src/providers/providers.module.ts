import { Global, Module } from '@nestjs/common';
import { IakService } from './iak.service';
import { DigiflazzService } from './digiflazz.service';
import { TripayService } from './tripay.service';
import { PrismaService } from '../prisma.service';

@Global()
@Module({
  providers: [IakService, DigiflazzService, TripayService, PrismaService],
  exports: [IakService, DigiflazzService, TripayService, PrismaService],
})
export class ProvidersModule {}
