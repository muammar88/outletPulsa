import { Module } from '@nestjs/common';
import { EmoneyLinkquService } from './emoney_linkqu.service';
import { EmoneyLinkquController } from './emoney_linkqu.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [EmoneyLinkquController],
  providers: [EmoneyLinkquService, PrismaService],
})
export class EmoneyLinkquModule {}
