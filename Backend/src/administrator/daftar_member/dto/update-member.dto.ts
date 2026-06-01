import { PartialType } from '@nestjs/mapped-types';
import { CreateMemberDto } from './create-member.dto';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateMemberDto extends PartialType(CreateMemberDto) {
  @IsString()
  @IsOptional()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password?: string;
}
