import { Module } from '@nestjs/common';
import { AgenController } from './agen.controller';
import { AgenService } from './agen.service';
import { PassportModule } from '@nestjs/passport';
import { JwtApiStrategy } from '../strategies/jwt-api.strategy';
import { PrismaService } from '../../prisma.service';

@Module({
  imports: [PassportModule],
  controllers: [AgenController],
  providers: [AgenService, JwtApiStrategy, PrismaService],
})
export class AgenModule {}
