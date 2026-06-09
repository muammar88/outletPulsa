import { PartialType } from '@nestjs/mapped-types';
import { CreateOperatorPrabayarTripayDto } from './create-operator-prabayar-tripay.dto';

export class UpdateOperatorPrabayarTripayDto extends PartialType(CreateOperatorPrabayarTripayDto) {}
