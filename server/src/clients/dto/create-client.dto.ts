import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import { ClientIdentityType } from '../../generated/prisma/client';

export class CreateClientDto {
  @ApiProperty({
    example: 'Ahmed Ali',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @ApiProperty({
    example: '+97333123456',
    description: 'WhatsApp number in international E.164 format',
  })
  @IsString()
  @Matches(/^\+[1-9]\d{7,14}$/, {
    message:
      'WhatsApp number must be in international format, for example +97333123456',
  })
  whatsappNumber: string;

  @ApiProperty({
    enum: ClientIdentityType,
    example: ClientIdentityType.CPR,
  })
  @IsEnum(ClientIdentityType)
  identityType: ClientIdentityType;

  @ApiProperty({
    example: '123456789',
    description: 'CPR or passport number. It will be encrypted before storage.',
  })
  @IsString()
  @MinLength(4)
  @MaxLength(50)
  identityNumber: string;
}
