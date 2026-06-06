import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { RiwayatController } from './riwayat.controller';
import { JwtApiStrategy } from '../strategies/jwt-api.strategy';

@Module({
  imports: [PassportModule],
  controllers: [RiwayatController],
  providers: [JwtApiStrategy],
})
export class RiwayatModule {}
