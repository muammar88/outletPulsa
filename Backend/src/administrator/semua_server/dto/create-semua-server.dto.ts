import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ServerStatus } from '@prisma/client';

export class CreateSemuaServerDto {
  @IsNotEmpty({ message: 'Kode tidak boleh kosong' })
  @IsString({ message: 'Kode harus berupa string' })
  kode: string;

  @IsNotEmpty({ message: 'Nama tidak boleh kosong' })
  @IsString({ message: 'Nama harus berupa string' })
  name: string;

  @IsOptional()
  @IsEnum(ServerStatus, { message: 'Status tidak valid' })
  status?: ServerStatus;
}
