import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTransaksiPrabayarDto {
  @IsNotEmpty()
  @IsString()
  kode_produk: string;

  @IsNotEmpty()
  @IsString()
  nomor_tujuan: string;
}
