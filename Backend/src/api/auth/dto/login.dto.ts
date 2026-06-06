import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  /**
   * Nomor WhatsApp yang digunakan untuk login dari aplikasi mobile
   */
  @IsNotEmpty({ message: 'Nomor WhatsApp tidak boleh kosong' })
  @IsString()
  whatsapp_number: string;

  /**
   * Password akun member
   */
  @IsNotEmpty({ message: 'Password tidak boleh kosong' })
  @IsString()
  password: string;
}
