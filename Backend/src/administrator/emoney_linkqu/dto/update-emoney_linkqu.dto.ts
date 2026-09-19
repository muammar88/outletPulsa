import { PartialType } from '@nestjs/swagger';
import { CreateEmoneyLinkquDto } from './create-emoney_linkqu.dto';

export class UpdateEmoneyLinkquDto extends PartialType(CreateEmoneyLinkquDto) {}
