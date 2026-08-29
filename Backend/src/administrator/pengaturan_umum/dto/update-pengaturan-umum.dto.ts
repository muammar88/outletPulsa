import { IsOptional, IsString } from 'class-validator';

export class UpdatePengaturanUmumDto {
  @IsOptional()
  @IsString()
  nama_aplikasi?: string;

  @IsOptional()
  @IsString()
  deskripsi?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  telepon?: string;

  @IsOptional()
  @IsString()
  alamat?: string;

  @IsOptional()
  @IsString()
  bullmq_schedules?: string;

  @IsOptional()
  @IsString()
  wa_api_url?: string;

  @IsOptional()
  @IsString()
  wa_api_key?: string;

  @IsOptional()
  @IsString()
  wa_device_key?: string;
}
