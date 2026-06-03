import { IsNumber, IsString, IsEnum, IsOptional } from 'class-validator';
import { RiwayatSaldoStatus } from '@prisma/client';

export class UpdateDepositDto {
  @IsOptional()
  @IsNumber()
  member_id?: number;

  @IsOptional()
  @IsNumber()
  nominal?: number;

  @IsOptional()
  @IsEnum(RiwayatSaldoStatus)
  status?: RiwayatSaldoStatus;

  @IsOptional()
  @IsString()
  ket?: string;
}
