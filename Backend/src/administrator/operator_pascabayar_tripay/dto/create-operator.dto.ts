import { IsNotEmpty, IsString, IsOptional, IsInt } from 'class-validator';

export class CreateOperatorDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  kode: string;

  @IsOptional()
  @IsInt()
  kategoriId?: number;
}
