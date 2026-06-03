import { IsOptional, IsString, IsEnum } from 'class-validator';
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
  @IsEnum(ProdukType)
  type?: ProdukType;
}
