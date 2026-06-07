import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { InfoController } from './info.controller';
import { InfoService } from './info.service';
import { JwtApiStrategy } from '../strategies/jwt-api.strategy';
import { PrismaService } from '../../prisma.service';

@Module({
  imports: [PassportModule],
  controllers: [InfoController],
  providers: [InfoService, JwtApiStrategy, PrismaService],
})
export class InfoModule {}
