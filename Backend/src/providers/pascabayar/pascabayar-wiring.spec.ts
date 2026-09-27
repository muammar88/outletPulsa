import { Test } from '@nestjs/testing';
import { ProvidersModule } from '../providers.module';
import { WebhookModule } from '../../api/webhook/webhook.module';
import { TransaksiPascabayarModule } from '../../api/transaksi_pascabayar/transaksi-pascabayar.module';
import { PrismaService } from '../../prisma.service';
import { WebhookService } from '../../api/webhook/webhook.service';
import { TransaksiPascabayarService } from '../../api/transaksi_pascabayar/transaksi-pascabayar.service';
import { PascabayarFinalizerService } from './pascabayar-finalizer.service';
import { PascabayarRouterService } from './pascabayar-router.service';
import { PATH_METADATA, METHOD_METADATA } from '@nestjs/common/constants';
import { StubController } from '../../api/stub/stub.controller';
import { TransaksiPascabayarController } from '../../api/transaksi_pascabayar/transaksi-pascabayar.controller';

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

  it('tidak ada rute pascabayar yang terdaftar ganda antar-controller', () => {
    const collect = (controller: any): string[] => {
      const base = Reflect.getMetadata(PATH_METADATA, controller) ?? '';
      const routes: string[] = [];
      for (const key of Object.getOwnPropertyNames(controller.prototype)) {
        if (key === 'constructor') continue;
        const path = Reflect.getMetadata(PATH_METADATA, controller.prototype[key]);
        const method = Reflect.getMetadata(METHOD_METADATA, controller.prototype[key]);
        if (path === undefined || method === undefined) continue;
        routes.push(`${method} ${String(base)}/${String(path)}`);
      }
      return routes;
    };

    const stubRoutes = collect(StubController);
    const pascaRoutes = collect(TransaksiPascabayarController);
    const duplicated = stubRoutes.filter((r) => pascaRoutes.includes(r));
    expect(duplicated).toEqual([]);
  });
});

