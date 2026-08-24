import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import { ClientIdentityType } from '../../generated/prisma/client';

export class UpdateClientDto {
  @ApiPropertyOptional({
    example: 'Ahmed Ali',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({
    example: '+97333123456',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\+[1-9]\d{7,14}$/, {
    message:
      'WhatsApp number must be in international format, for example +97333123456',
  })
  whatsappNumber?: string;

  @ApiPropertyOptional({
    enum: ClientIdentityType,
  })
  @IsOptional()
  @IsEnum(ClientIdentityType)
  identityType?: ClientIdentityType;

  @ApiPropertyOptional({
    example: '123456789',
  })
  @IsOptional()
  @IsString()
  @MinLength(4)
  @MaxLength(50)
  identityNumber?: string;

  @ApiPropertyOptional({
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
