import { PartialType } from '@nestjs/mapped-types';
import { CreateAgenDto } from './create-agen.dto';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateAgenDto extends PartialType(CreateAgenDto) {
  @IsString()
  @IsOptional()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password?: string;
}
