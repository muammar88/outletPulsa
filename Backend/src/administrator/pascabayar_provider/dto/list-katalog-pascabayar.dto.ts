import { IsIn, IsOptional, IsString } from 'class-validator';

/** Query daftar katalog pascabayar Digiflazz. */
export class ListKatalogPascabayarDto {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  seller?: string;

  @IsOptional()
  @IsIn(['available', 'unavailable', 'unknown'], {
    message: 'availability harus available, unavailable, atau unknown.',
  })
  availability?: string;

  @IsOptional()
  @IsIn(['connected', 'disconnected'], {
    message: 'connected harus connected atau disconnected.',
  })
  connected?: string;
}