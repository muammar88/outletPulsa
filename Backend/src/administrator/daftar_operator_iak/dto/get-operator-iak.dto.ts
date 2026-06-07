import { IsOptional, IsString } from 'class-validator';

export class GetOperatorIakDto {
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
  typeId?: string;
}
