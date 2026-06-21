import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateBankDto {
  @IsString()
  @IsNotEmpty({ message: 'Kode bank tidak boleh kosong' })
  kode: string;

  @IsString()
  @IsNotEmpty({ message: 'Nama bank tidak boleh kosong' })
  nama: string;

  @IsString()
  @IsOptional()
  image?: string;
}
