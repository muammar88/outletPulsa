import { PartialType } from '@nestjs/mapped-types';
import { CreateBankTransferOutletDto } from './create-bank-transfer-outlet.dto';

export class UpdateBankTransferOutletDto extends PartialType(CreateBankTransferOutletDto) {}
