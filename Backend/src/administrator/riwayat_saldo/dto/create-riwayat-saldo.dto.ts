import { IsInt, IsNotEmpty, IsEnum, IsOptional, IsString } from 'class-validator';
import { RiwayatSaldoStatus } from '@prisma/client';

export class CreateRiwayatSaldoDto {
  @IsString({ message: 'Kode harus berupa teks' })
  @IsNotEmpty({ message: 'Kode wajib diisi' })
  kode: string;

  @IsInt({ message: 'Nominal harus berupa angka' })
  @IsNotEmpty({ message: 'Nominal wajib diisi' })
  nominal: number;

  @IsInt({ message: 'Saldo sebelumnya harus berupa angka' })
  @IsNotEmpty({ message: 'Saldo sebelumnya wajib diisi' })
  saldo_sebelumnya: number;

  @IsInt({ message: 'Saldo setelahnya harus berupa angka' })
  @IsNotEmpty({ message: 'Saldo setelahnya wajib diisi' })
  saldo_setelahnya: number;

  @IsEnum(RiwayatSaldoStatus, { message: 'Status tidak valid. Harus salah satu dari: pembelian_pulsa, deposit, transfer_pulsa, pencairan_fee_agen' })
  @IsNotEmpty({ message: 'Status wajib diisi' })
  status: RiwayatSaldoStatus;

  @IsOptional()
  @IsString()
  ket?: string;
}
