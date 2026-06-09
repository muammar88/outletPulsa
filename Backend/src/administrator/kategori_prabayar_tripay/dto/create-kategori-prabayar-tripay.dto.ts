import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateKategoriPrabayarTripayDto {
  @IsNotEmpty({ message: 'Nama kategori tidak boleh kosong' })
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  type?: string;
}
