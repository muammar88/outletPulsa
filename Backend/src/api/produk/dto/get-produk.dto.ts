import { IsOptional, IsString, IsInt, Min, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class GetProdukDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  kategori?: string;

  @IsNotEmpty({ message: 'Operator tidak boleh kosong' })
  @IsString({ message: 'Operator harus berupa teks' })
  operator: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
