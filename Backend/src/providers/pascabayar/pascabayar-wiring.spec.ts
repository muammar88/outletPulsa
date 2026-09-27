import { Test } from '@nestjs/testing';
import { ProvidersModule } from '../providers.module';
import { WebhookModule } from '../../api/webhook/webhook.module';
import { TransaksiPascabayarModule } from '../../api/transaksi_pascabayar/transaksi-pascabayar.module';
import { PrismaService } from '../../prisma.service';
import { WebhookService } from '../../api/webhook/webhook.service';
import { TransaksiPascabayarService } from '../../api/transaksi_pascabayar/transaksi-pascabayar.service';
import { PascabayarFinalizerService } from './pascabayar-finalizer.service';
import { PascabayarRouterService } from './pascabayar-router.service';

describe('DI wiring pascabayar multi-provider', () => {
  it('modul produksi dapat dikompilasi dan service kunci resolve', async () => {
    const prismaStub = {
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      $executeRawUnsafe: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [ProvidersModule, WebhookModule, TransaksiPascabayarModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaStub)
      .compile();

    expect(moduleRef.get(PascabayarRouterService)).toBeDefined();
    expect(moduleRef.get(PascabayarFinalizerService)).toBeDefined();
    expect(moduleRef.get(WebhookService)).toBeDefined();
    expect(moduleRef.get(TransaksiPascabayarService)).toBeDefined();

    await moduleRef.close();
  });
});

