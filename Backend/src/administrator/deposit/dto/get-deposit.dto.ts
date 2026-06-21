import { IsOptional, IsString, IsEnum } from 'class-validator';
import { TransactionStatus } from '@prisma/client';

export class GetDepositDto {
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
  @IsEnum(TransactionStatus)
  kategori?: TransactionStatus;
}
