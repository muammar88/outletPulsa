import { Module } from '@nestjs/common';
import { SemuaServerService } from './semua_server.service';
import { SemuaServerController } from './semua_server.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [SemuaServerController],
  providers: [SemuaServerService, PrismaService],
})
export class SemuaServerModule {}
