import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetOtpRegisterDto {
  @IsNotEmpty({ message: 'Nomor WhatsApp wajib diisi' })
  @IsString()
  whatsapp: string;

  @IsNotEmpty({ message: 'device_code wajib diisi' })
  @IsString()
  device_code: string;
}

export class RegisterDto {
  @IsNotEmpty({ message: 'Nama Pengguna wajib diisi' })
  @IsString()
  nama_pengguna: string;

  @IsNotEmpty({ message: 'Nomor WhatsApp wajib diisi' })
  @IsString()
  whatsapp: string;

  @IsNotEmpty({ message: 'OTP wajib diisi' })
  @IsString()
  otp: string;

  @IsNotEmpty({ message: 'Password wajib diisi' })
  @IsString()
  password: string;

  @IsNotEmpty({ message: 'device_code wajib diisi' })
  @IsString()
  device_code: string;

  @IsOptional()
  @IsString()
  kode_referal?: string;
}
