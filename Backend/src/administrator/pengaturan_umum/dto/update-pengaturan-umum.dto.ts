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
}
