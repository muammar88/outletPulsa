import { PartialType } from '@nestjs/mapped-types';
import { CreateSemuaServerDto } from './create-semua-server.dto';

export class UpdateSemuaServerDto extends PartialType(CreateSemuaServerDto) {}
