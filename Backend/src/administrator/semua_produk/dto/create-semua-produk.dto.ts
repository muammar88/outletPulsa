import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { ProdukType, ProdukStatus } from '@prisma/client';

export class CreateSemuaProdukDto {
  @IsNumber()
  @IsOptional()
  operatorId?: number;

  @IsString()
  @IsNotEmpty()
  kode: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(ProdukType)
  @IsOptional()
  type?: ProdukType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  purchase_price?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  markup?: number;

  @IsNumber()
  @IsOptional()
  serverId?: number;

  @IsEnum(ProdukStatus)
  @IsOptional()
  status?: ProdukStatus;
}
