import { IsIn, IsOptional, IsString } from 'class-validator';

/** Query pilihan produk pascabayar internal untuk pemetaan provider. */
export class InternalProductsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['IAK', 'DIGIFLAZZ'], { message: 'Provider harus IAK atau DIGIFLAZZ.' })
  provider?: string;

  @IsOptional()
  @IsString()
  connection?: string;

  @IsOptional()
  @IsString()
  catalogId?: string;
}