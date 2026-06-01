import { PartialType } from '@nestjs/mapped-types';
import { CreateSemuaProdukDto } from './create-semua-produk.dto';

export class UpdateSemuaProdukDto extends PartialType(CreateSemuaProdukDto) {}
