import { PartialType } from '@nestjs/mapped-types';
import { CreateOperatorPascabayarTripayDto } from './create-operator-pascabayar-tripay.dto';

export class UpdateOperatorPascabayarTripayDto extends PartialType(CreateOperatorPascabayarTripayDto) {}
