import { IsIn } from 'class-validator';

/** Body aksi pemilihan/pelepasan provider pada produk pascabayar internal. */
export class ProviderActionDto {
  @IsIn(['IAK', 'DIGIFLAZZ'], { message: 'Provider harus IAK atau DIGIFLAZZ.' })
  provider!: 'IAK' | 'DIGIFLAZZ';
}