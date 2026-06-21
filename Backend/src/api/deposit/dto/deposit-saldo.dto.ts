import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class DepositSaldoDto {
  @IsNotEmpty({ message: 'Nominal tidak boleh kosong' })
  nominal: string | number;

  @IsNotEmpty({ message: 'Bank tujuan transfer tidak boleh kosong' })
  bank_tujuan_transfer: string | number;
}
