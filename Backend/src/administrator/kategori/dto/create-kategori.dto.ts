import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ProdukType } from '@prisma/client';

export class CreateKategoriDto {
  @IsString()
  @IsNotEmpty()
  kode: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(ProdukType)
  @IsOptional()
  type?: ProdukType;
}
