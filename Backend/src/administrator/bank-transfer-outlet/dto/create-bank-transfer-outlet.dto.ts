import { IsInt, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateBankTransferOutletDto {
  @IsInt({ message: 'Bank ID harus berupa angka' })
  @IsNotEmpty({ message: 'Bank ID tidak boleh kosong' })
  bankId: number;

  @IsString({ message: 'Nama pemilik rekening harus berupa teks' })
  @IsNotEmpty({ message: 'Nama pemilik rekening tidak boleh kosong' })
  accountName: string;

  @IsString({ message: 'Nomor rekening harus berupa teks' })
  @IsNotEmpty({ message: 'Nomor rekening tidak boleh kosong' })
  accountNumber: string;
}
