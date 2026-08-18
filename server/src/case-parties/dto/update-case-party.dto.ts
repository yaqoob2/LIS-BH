import { PartialType } from '@nestjs/swagger';
import { CreateCasePartyDto } from './create-case-party.dto';

export class UpdateCasePartyDto extends PartialType(CreateCasePartyDto) {}
