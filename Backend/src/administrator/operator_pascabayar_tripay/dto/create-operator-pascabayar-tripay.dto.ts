import { IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOperatorPascabayarTripayDto {
  @IsNotEmpty({ message: 'Nama operator tidak boleh kosong' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Kode operator tidak boleh kosong' })
  @IsString()
  kode: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  kategoriId?: number;
}
