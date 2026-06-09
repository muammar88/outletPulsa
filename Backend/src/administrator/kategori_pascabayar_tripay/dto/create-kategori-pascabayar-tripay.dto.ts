import { IsNotEmpty, IsString } from 'class-validator';

export class CreateKategoriPascabayarTripayDto {
  @IsNotEmpty({ message: 'Nama kategori wajib diisi' })
  @IsString({ message: 'Nama kategori harus berupa teks' })
  name: string;
}
