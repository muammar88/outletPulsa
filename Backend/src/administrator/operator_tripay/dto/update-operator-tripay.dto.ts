import { PartialType } from '@nestjs/mapped-types';
import { CreateOperatorTripayDto } from './create-operator-tripay.dto';

export class UpdateOperatorTripayDto extends PartialType(CreateOperatorTripayDto) {}
