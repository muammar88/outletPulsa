import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class TambahSaldoDto {
  @IsInt({ message: 'Member ID harus berupa angka' })
  @IsNotEmpty({ message: 'Member ID wajib diisi' })
  member_id: number;

  @IsInt({ message: 'Nominal harus berupa angka' })
  @Min(1, { message: 'Nominal harus lebih besar dari 0' })
  @IsNotEmpty({ message: 'Nominal wajib diisi' })
  nominal: number;
}
