import { IsOptional, IsString, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetBankTransferOutletDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  perPage?: number = 10;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  page?: number = 1;

  @IsOptional()
  @IsString()
  keyword?: string;
}
