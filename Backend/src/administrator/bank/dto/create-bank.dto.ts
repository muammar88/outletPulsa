import { IsString, IsNotEmpty, IsOptional, Length, IsAlpha } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateBankDto {
  @IsString()
  @IsNotEmpty({ message: 'Kode bank tidak boleh kosong' })
  @Length(3, 3, { message: 'Kode bank harus tepat 3 karakter' })
  @IsAlpha('en-US', { message: 'Kode bank hanya boleh berisi huruf' })
  @Transform(({ value }) => value?.toUpperCase())
  kode: string;

  @IsString()
  @IsNotEmpty({ message: 'Nama bank tidak boleh kosong' })
  nama: string;

  @IsString()
  @IsOptional()
  image?: string;
}
