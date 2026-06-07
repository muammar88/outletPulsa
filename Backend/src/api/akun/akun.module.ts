import { Module } from '@nestjs/common';
import { AkunController } from './akun.controller';
import { AkunService } from './akun.service';
import { PassportModule } from '@nestjs/passport';
import { JwtApiStrategy } from '../strategies/jwt-api.strategy';
import { PrismaService } from '../../prisma.service';

@Module({
  imports: [PassportModule],
  controllers: [AkunController],
  providers: [AkunService, JwtApiStrategy, PrismaService],
})
export class AkunModule {}
