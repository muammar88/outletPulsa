import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateKategoriDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  type?: string;
}
