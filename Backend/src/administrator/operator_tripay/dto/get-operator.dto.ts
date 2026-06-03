import { IsOptional, IsString } from 'class-validator';

export class GetOperatorDto {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  kategoriId?: string;
}
