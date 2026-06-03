import { IsOptional, IsString, IsEnum } from 'class-validator';
import { RiwayatSaldoStatus } from '@prisma/client';

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
  @IsEnum(RiwayatSaldoStatus)
  kategori?: RiwayatSaldoStatus;
}
