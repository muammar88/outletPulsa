import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

/**
 * Body koneksi produk pascabayar internal ke provider.
 * `digiflazzProductId` adalah ID katalog Digiflazz, bukan ID produk internal.
 */
export class ConnectPascabayarProviderDto {
  @IsIn(['IAK', 'DIGIFLAZZ'], { message: 'Provider harus IAK atau DIGIFLAZZ.' })
  provider!: 'IAK' | 'DIGIFLAZZ';

  @IsString({ message: 'SKU provider wajib berupa teks.' })
  @IsNotEmpty({ message: 'SKU provider wajib diisi.' })
  @MaxLength(120, { message: 'SKU provider terlalu panjang.' })
  providerSku!: string;

  @ValidateIf((o: ConnectPascabayarProviderDto) => o.iakProductId !== null && o.iakProductId !== undefined)
  @Type(() => Number)
  @IsInt({ message: 'iakProductId harus bilangan bulat.' })
  @IsPositive({ message: 'iakProductId harus bilangan bulat positif.' })
  iakProductId?: number | null;

  @ValidateIf(
    (o: ConnectPascabayarProviderDto) => o.digiflazzProductId !== null && o.digiflazzProductId !== undefined,
  )
  @Type(() => Number)
  @IsInt({ message: 'digiflazzProductId harus bilangan bulat.' })
  @IsPositive({ message: 'digiflazzProductId harus bilangan bulat positif.' })
  digiflazzProductId?: number | null;
}