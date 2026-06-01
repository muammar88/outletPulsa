import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateStatusDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(['proses', 'gagal', 'sukses'])
  status: 'proses' | 'gagal' | 'sukses';

  @IsOptional()
  @IsString()
  keterangan?: string;
}
