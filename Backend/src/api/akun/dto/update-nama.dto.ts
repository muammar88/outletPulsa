import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdateNamaDto {
  @IsNotEmpty({ message: 'Nama tidak boleh kosong' })
  @IsString({ message: 'Nama harus berupa teks' })
  @MinLength(3, { message: 'Nama minimal 3 karakter' })
  nama: string;
}
