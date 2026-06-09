import { PartialType } from '@nestjs/mapped-types';
import { CreateKategoriPrabayarTripayDto } from './create-kategori-prabayar-tripay.dto';

export class UpdateKategoriPrabayarTripayDto extends PartialType(CreateKategoriPrabayarTripayDto) {}
