import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePasswordDto {
  @IsNotEmpty({ message: 'Password lama wajib diisi' })
  @IsString({ message: 'Password lama harus berupa teks' })
  passwordLama: string;

  @IsNotEmpty({ message: 'Password baru wajib diisi' })
  @IsString({ message: 'Password baru harus berupa teks' })
  passwordBaru: string;

  @IsNotEmpty({ message: 'Konfirmasi password wajib diisi' })
  @IsString({ message: 'Konfirmasi password harus berupa teks' })
  konfirmasiPassword: string;
}
