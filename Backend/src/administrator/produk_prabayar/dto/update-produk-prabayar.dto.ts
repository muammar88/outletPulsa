import { PartialType } from '@nestjs/mapped-types';
import { CreateProdukPrabayarDto } from './create-produk-prabayar.dto';

export class UpdateProdukPrabayarDto extends PartialType(CreateProdukPrabayarDto) {}
