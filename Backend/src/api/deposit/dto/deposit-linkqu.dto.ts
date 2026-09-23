import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class DepositLinkquDto {
  @IsNotEmpty({ message: 'Nominal tidak boleh kosong' })
  nominal: string | number;

  @IsNotEmpty({ message: 'Metode pembayaran tidak boleh kosong' })
  @IsString()
  payment_method: string;

  @IsOptional()
  @IsString()
  bank_code?: string;

  @IsOptional()
  @IsString()
  idempotency_key?: string;
}
