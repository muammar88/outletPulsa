import { IsOptional, IsString, IsEnum } from 'class-validator';
import { TransactionStatus } from '@prisma/client';

export class UpdateDepositStatusDto {
  @IsEnum(TransactionStatus)
  status: TransactionStatus;

  @IsOptional()
  @IsString()
  alasanPenolakan?: string;
}
