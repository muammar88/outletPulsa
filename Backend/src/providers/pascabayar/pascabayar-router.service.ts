import { BadRequestException, Injectable } from '@nestjs/common';
import { DigiflazzPascabayarAdapter } from './digiflazz-pascabayar.adapter';
import { IakPascabayarAdapter } from './iak-pascabayar.adapter';
import { PascabayarAdapter, PascabayarProviderCode } from './pascabayar.types';

/** Registry adapter pascabayar. Provider yang tidak terdaftar ditolak. */
@Injectable()
export class PascabayarRouterService {
  private readonly adapters: Record<PascabayarProviderCode, PascabayarAdapter>;

  constructor(digiflazz: DigiflazzPascabayarAdapter, iak: IakPascabayarAdapter) {
    this.adapters = {
      DIGIFLAZZ: digiflazz,
      IAK: iak,
    };
  }

  getAdapter(provider: PascabayarProviderCode): PascabayarAdapter {
    const adapter = this.adapters[provider];
    if (!adapter) {
      throw new BadRequestException(`Provider pascabayar ${provider} tidak didukung`);
    }
    return adapter;
  }
}

