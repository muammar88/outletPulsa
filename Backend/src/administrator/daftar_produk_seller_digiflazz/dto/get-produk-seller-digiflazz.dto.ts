import { IsOptional, IsString } from 'class-validator';

export class GetProdukSellerDigiflazzDto {
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
  sellerId?: string;
}
