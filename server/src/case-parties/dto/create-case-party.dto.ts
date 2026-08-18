import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

import { PartyType } from '../../generated/prisma/client';

export class CreateCasePartyDto {
  @ApiProperty()
  @IsUUID()
  caseId: string;

  @ApiProperty({
    example: 'Ahmed Ali',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(250)
  name: string;

  @ApiProperty({
    enum: PartyType,
    example: PartyType.PERSON,
  })
  @IsEnum(PartyType)
  partyType: PartyType;

  @ApiProperty({
    example: 'Claimant',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  roleInCase: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
