import { BadRequestException } from '@nestjs/common';
import { PascabayarRouterService } from './pascabayar-router.service';

describe('PascabayarRouterService', () => {
  const digiflazz = { provider: 'DIGIFLAZZ' } as any;
  const iak = { provider: 'IAK' } as any;
  const router = new PascabayarRouterService(digiflazz, iak);

  it('mengembalikan adapter sesuai provider', () => {
    expect(router.getAdapter('DIGIFLAZZ')).toBe(digiflazz);
    expect(router.getAdapter('IAK')).toBe(iak);
  });

  it('menolak provider yang tidak dikenal', () => {
    expect(() => router.getAdapter('UNKNOWN' as any)).toThrow(BadRequestException);
  });
});

