import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, MinLength } from 'class-validator';
import { MemberStatus, MemberType, AgenType } from '@prisma/client';

export class CreateMemberDto {
  @IsString()
  @IsNotEmpty()
  kode: string;

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

  @IsEnum(MemberType)
  @IsOptional()
  type?: MemberType;

  @IsEnum(AgenType)
  @IsOptional()
  agenType?: AgenType;
}
