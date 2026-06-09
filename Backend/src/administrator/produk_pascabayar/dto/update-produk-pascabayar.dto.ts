import { PartialType } from '@nestjs/mapped-types';
import { CreateProdukPascabayarDto } from './create-produk-pascabayar.dto';

export class UpdateProdukPascabayarDto extends PartialType(CreateProdukPascabayarDto) {}
