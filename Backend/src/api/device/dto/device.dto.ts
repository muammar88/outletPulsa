import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterDeviceDto {
  @IsOptional()
  @IsString()
  device_code?: string;

  @IsOptional()
  @IsString()
  device_name?: string;

  @IsOptional()
  @IsString()
  device_brand?: string;

  @IsOptional()
  @IsString()
  device_model?: string;

  @IsOptional()
  @IsString()
  os_name?: string;

  @IsOptional()
  @IsString()
  os_version?: string;

  @IsOptional()
  @IsString()
  app_version?: string;
}

export class ValidateDeviceDto {
  @IsNotEmpty({ message: 'device_code wajib diisi' })
  @IsString()
  device_code: string;
}
