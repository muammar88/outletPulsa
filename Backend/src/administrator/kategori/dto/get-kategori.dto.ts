import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { ProdukType } from '@prisma/client';

export class GetKategoriDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;
  
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsEnum(ProdukType)
  type?: ProdukType;
}
