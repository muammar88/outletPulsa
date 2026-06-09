import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class GetTripayProductDto {
  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  operatorId?: string;

  @IsOptional()
  @IsString()
  kategoriId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  connectionStatus?: string;

  @IsOptional()
  @IsString()
  sortBy?: string; // e.g. "name", "price", "createdAt"

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}
