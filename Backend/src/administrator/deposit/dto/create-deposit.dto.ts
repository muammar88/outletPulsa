import { IsNotEmpty, IsNumber, IsString, IsEnum, IsOptional } from 'class-validator';
import { RiwayatSaldoStatus } from '@prisma/client';

export class CreateDepositDto {
  @IsNotEmpty()
  @IsNumber()
  member_id: number;

  @IsNotEmpty()
  @IsNumber()
  nominal: number;

  @IsNotEmpty()
  @IsEnum(RiwayatSaldoStatus)
  status: RiwayatSaldoStatus;

  @IsOptional()
  @IsString()
  ket?: string;
}
