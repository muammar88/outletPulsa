import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { StubController } from './stub.controller';
import { JwtApiStrategy } from '../strategies/jwt-api.strategy';

@Module({
  imports: [PassportModule],
  controllers: [StubController],
  providers: [JwtApiStrategy],
})
export class StubModule {}
