import { IsString, IsNotEmpty, IsOptional, IsNumber, IsIn } from 'class-validator';
import { ProdukStatus } from '@prisma/client';

export class CreateProdukPascabayarDto {
  @IsNumber()
  @IsOptional()
  kategoriId?: number;

  @IsString()
  @IsNotEmpty()
  kode: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsOptional()
  fee?: number;

  @IsNumber()
  @IsOptional()
  comission?: number;

  @IsNumber()
  @IsOptional()
  outletFee?: number;

  @IsNumber()
  @IsOptional()
  serverId?: number;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: ProdukStatus;
}