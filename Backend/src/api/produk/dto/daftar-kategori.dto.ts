import { IsNotEmpty, IsString } from 'class-validator';

export class DaftarKategoriDto {
  @IsNotEmpty({ message: 'Field kode wajib diisi' })
  @IsString()
  kode: string;
}
