import { PartialType } from '@nestjs/mapped-types';
import { CreateKategoriTripayDto } from './create-kategori-tripay.dto';

export class UpdateKategoriTripayDto extends PartialType(CreateKategoriTripayDto) {}
