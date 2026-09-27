import { Module } from '@nestjs/common';
import { PascabayarProviderController } from './pascabayar_provider.controller';

@Module({
  controllers: [PascabayarProviderController],
})
export class PascabayarProviderModule {}

