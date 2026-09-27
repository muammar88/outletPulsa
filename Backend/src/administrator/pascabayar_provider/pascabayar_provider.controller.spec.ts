import { BadRequestException, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PascabayarCatalogService } from '../../providers/pascabayar/pascabayar-catalog.service';
import { PascabayarProviderController } from './pascabayar_provider.controller';

describe('PascabayarProviderController (validasi HTTP)', () => {
  let app: INestApplication;
  const catalog = {
    listDigiflazzPascabayarProducts: jest.fn().mockResolvedValue({ list: [], total: 0 }),
    connectProvider: jest.fn().mockResolvedValue({}),
    selectActiveProvider: jest.fn().mockResolvedValue({}),
    disconnectProvider: jest.fn().mockResolvedValue({}),
    listCandidates: jest.fn().mockResolvedValue([]),
    compareProviders: jest.fn().mockResolvedValue({}),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [PascabayarProviderController],
      providers: [{ provide: PascabayarCatalogService, useValue: catalog }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        exceptionFactory: (errors) => {
          const messages = errors
            .map((error) => Object.values(error.constraints || {}).join(', '))
            .join('; ');
          return new BadRequestException({ error: true, message: messages, data: {} });
        },
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => jest.clearAllMocks());

  it('menolak ID katalog non-numerik dengan 400 tanpa memanggil service', async () => {
    const res = await request(app.getHttpServer())
      .post('/administrator/pascabayar-provider/produk/1/connect')
      .send({ provider: 'DIGIFLAZZ', providerSku: 'PLN', digiflazzProductId: 'abc', iakProductId: null });

    expect(res.status).toBe(400);
    expect(catalog.connectProvider).not.toHaveBeenCalled();
  });

  it('menolak ID URL non-numerik, nol, dan negatif dengan 400', async () => {
    for (const id of ['abc', '0', '-2']) {
      const res = await request(app.getHttpServer())
        .post(`/administrator/pascabayar-provider/produk/${id}/connect`)
        .send({ provider: 'DIGIFLAZZ', providerSku: 'PLN', digiflazzProductId: 1, iakProductId: null });
      expect(res.status).toBe(400);
    }
    expect(catalog.connectProvider).not.toHaveBeenCalled();
  });

  it('meneruskan payload valid dengan ID URL dan ID katalog berupa angka', async () => {
    const res = await request(app.getHttpServer())
      .post('/administrator/pascabayar-provider/produk/9/connect')
      .send({ provider: 'DIGIFLAZZ', providerSku: 'PLN', digiflazzProductId: '12', iakProductId: null });

    expect(res.status).toBe(201);
    expect(catalog.connectProvider).toHaveBeenCalledWith(
      expect.objectContaining({ produkPascabayarId: 9, digiflazzProductId: 12, providerSku: 'PLN' }),
      expect.anything(),
    );
  });

  it('menolak provider tak dikenal dengan 400 tanpa memanggil service', async () => {
    const res = await request(app.getHttpServer())
      .post('/administrator/pascabayar-provider/produk/9/select')
      .send({ provider: 'SALAH' });

    expect(res.status).toBe(400);
    expect(catalog.selectActiveProvider).not.toHaveBeenCalled();
  });

  it('menolak availability di luar nilai yang didukung dengan 400', async () => {
    const res = await request(app.getHttpServer()).get(
      '/administrator/pascabayar-provider/katalog-digiflazz?availability=kadang',
    );

    expect(res.status).toBe(400);
    expect(catalog.listDigiflazzPascabayarProducts).not.toHaveBeenCalled();
  });
});