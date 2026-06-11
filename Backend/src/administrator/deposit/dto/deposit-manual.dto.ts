import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class DepositManualDto {
  @IsNumber()
  memberId: number;

  @IsNumber()
  @Min(1)
  nominal: number;

  @IsOptional()
  @IsString()
  ket?: string;
}
