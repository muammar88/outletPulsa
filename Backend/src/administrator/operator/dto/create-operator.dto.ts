import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateOperatorDto {
  @IsString()
  @IsNotEmpty()
  kode: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsOptional()
  kategoriId?: number;
}
