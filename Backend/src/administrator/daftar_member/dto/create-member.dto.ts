import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, MinLength } from 'class-validator';
import { MemberStatus } from '@prisma/client';

export class CreateMemberDto {
  @IsString()
  @IsNotEmpty()
  fullname: string;

  @IsString()
  @IsNotEmpty()
  whatsappnumber: string;

  @IsString()
  @IsOptional()
  kode_agen?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsNumber()
  @IsOptional()
  saldo?: number;

  @IsEnum(MemberStatus)
  @IsOptional()
  status?: MemberStatus;
}
