import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ParsePositiveIntPipe } from '../../common/pipes/parse-positive-int.pipe';
import { ConnectPascabayarProviderDto } from './dto/connect-pascabayar-provider.dto';
import { ListKatalogPascabayarDto } from './dto/list-katalog-pascabayar.dto';
import { ProviderActionDto } from './dto/provider-action.dto';

// Pipe yang sama dengan main.ts: whitelist + transform + envelope error 400.
const validationPipe = new ValidationPipe({
  whitelist: true,
  transform: true,
  exceptionFactory: (errors) => {
    const messages = errors
      .map((error) => Object.values(error.constraints || {}).join(', '))
      .join('; ');
    return new BadRequestException({ error: true, message: messages, data: {} });
  },
});

const meta = (metatype: any, type: 'body' | 'query' | 'param' = 'body') =>
  ({ type, metatype, data: '' }) as any;

describe('Validasi HTTP pascabayar-provider', () => {
  it('menolak ID katalog berupa string non-numerik dengan 400', async () => {
    await expect(
      validationPipe.transform(
        { provider: 'DIGIFLAZZ', providerSku: 'PLN', digiflazzProductId: 'abc', iakProductId: null },
        meta(ConnectPascabayarProviderDto),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('menolak ID katalog nol atau negatif', async () => {
    for (const value of [0, -3]) {
      await expect(
        validationPipe.transform(
          { provider: 'DIGIFLAZZ', providerSku: 'PLN', digiflazzProductId: value, iakProductId: null },
          meta(ConnectPascabayarProviderDto),
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    }
  });

  it('menerima payload koneksi valid dan mengubah ID string menjadi angka', async () => {
    const dto = await validationPipe.transform(
      { provider: 'DIGIFLAZZ', providerSku: 'PLN', digiflazzProductId: '12', iakProductId: null },
      meta(ConnectPascabayarProviderDto),
    );
    expect(dto.digiflazzProductId).toBe(12);
    expect(dto.iakProductId).toBeNull();
  });

  it('menolak provider tak dikenal pada body aksi', async () => {
    await expect(
      validationPipe.transform({ provider: 'SALAH' }, meta(ProviderActionDto)),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('membuang field query yang tidak didefinisikan (whitelist)', async () => {
    const dto = await validationPipe.transform(
      { search: 'pln', fieldTerlarang: 'x' },
      meta(ListKatalogPascabayarDto, 'query'),
    );
    expect(dto).toEqual({ search: 'pln' });
  });

  it('menolak availability dan connected di luar nilai yang didukung', async () => {
    await expect(
      validationPipe.transform({ availability: 'kadang' }, meta(ListKatalogPascabayarDto, 'query')),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      validationPipe.transform({ connected: 'mungkin' }, meta(ListKatalogPascabayarDto, 'query')),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('ParsePositiveIntPipe menerima bilangan bulat positif dan menolak sisanya dengan 400', async () => {
    const pipe = new ParsePositiveIntPipe();
    expect(pipe.transform('7')).toBe(7);
    for (const bad of ['abc', '0', '-1', '', '1.5']) {
      expect(() => pipe.transform(bad)).toThrow(BadRequestException);
    }
  });
});