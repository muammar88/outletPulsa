import { IsOptional, IsString, IsBoolean } from 'class-validator';

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

  // LinkQu Integration
  @IsOptional()
  @IsBoolean()
  linkqu_is_active?: boolean;

  @IsOptional()
  @IsString()
  linkqu_base_url_dev?: string;

  @IsOptional()
  @IsString()
  linkqu_base_url_prod?: string;

  @IsOptional()
  @IsString()
  linkqu_client_id?: string;

  @IsOptional()
  @IsString()
  linkqu_client_secret?: string;

  @IsOptional()
  @IsString()
  linkqu_pin?: string;

  @IsOptional()
  @IsString()
  linkqu_merchant_code?: string;

  @IsOptional()
  @IsString()
  linkqu_signature_key?: string;

  @IsOptional()
  @IsBoolean()
  linkqu_is_sandbox?: boolean;

  @IsOptional()
  @IsBoolean()
  linkqu_payment_va?: boolean;

  @IsOptional()
  @IsBoolean()
  linkqu_payment_ewallet?: boolean;

  @IsOptional()
  @IsBoolean()
  linkqu_payment_qris?: boolean;
}
