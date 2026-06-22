import { IsNotEmpty, IsString } from 'class-validator';

export class TransferSaldoDto {
  @IsNotEmpty({ message: 'Nomor tujuan tidak boleh kosong' })
  @IsString()
  nomor_tujuan: string;

  @IsNotEmpty({ message: 'Nominal tidak boleh kosong' })
  nominal: any; // Menerima number atau string dari klien

  @IsNotEmpty({ message: 'Password tidak boleh kosong' })
  @IsString()
  password: string;
}
