import { PartialType } from '@nestjs/mapped-types';
import { CreateKategoriPascabayarTripayDto } from './create-kategori-pascabayar-tripay.dto';

export class UpdateKategoriPascabayarTripayDto extends PartialType(CreateKategoriPascabayarTripayDto) {}

