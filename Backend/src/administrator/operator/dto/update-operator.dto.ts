import { PartialType } from '@nestjs/mapped-types';
import { CreateOperatorDto } from './create-operator.dto';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateOperatorDto extends PartialType(CreateOperatorDto) {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  prefixes?: string[];
}
