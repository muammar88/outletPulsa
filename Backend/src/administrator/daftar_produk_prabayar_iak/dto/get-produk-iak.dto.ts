import { IsOptional, IsString } from 'class-validator';

export class GetProdukIakDto {
  @IsString()
  @IsOptional()
  page?: string;

  @IsString()
  @IsOptional()
  limit?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  operatorId?: string;

  @IsString()
  @IsOptional()
  connectionStatus?: string;
}
