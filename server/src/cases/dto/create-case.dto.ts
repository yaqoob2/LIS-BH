import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

import { CasePriority, CaseStatus } from '../../generated/prisma/client';

export class CreateCaseDto {
  @ApiProperty({
    example: 'CASE-2026-001',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  referenceNumber: string;

  @ApiProperty({
    example: 'Employment Dispute',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(250)
  title: string;

  @ApiProperty({
    example: 'Labour',
  })
  @IsString()
  @MaxLength(100)
  caseType: string;

  @ApiPropertyOptional({
    example: 'Employment',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({
    enum: CaseStatus,
    default: CaseStatus.OPEN,
  })
  @IsOptional()
  @IsEnum(CaseStatus)
  status?: CaseStatus;

  @ApiPropertyOptional({
    enum: CasePriority,
    default: CasePriority.MEDIUM,
  })
  @IsOptional()
  @IsEnum(CasePriority)
  priority?: CasePriority;

  @ApiPropertyOptional({
    example: 'Employee claims wrongful termination and unpaid benefits.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Primary assigned lawyer/user ID',
  })
  @IsOptional()
  @IsUUID()
  assignedUserId?: string;

  @ApiPropertyOptional({
    description: 'Client linked to this case',
  })
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @ApiPropertyOptional({
    example: 1000,
    description: 'Total agreed professional fee for the case',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({
    maxDecimalPlaces: 3,
  })
  @Min(0.001)
  totalFee?: number;

  @ApiPropertyOptional({
    example: 'BHD',
    default: 'BHD',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z]{3}$/, {
    message: 'Currency must be a 3-letter currency code',
  })
  currency?: string;
}
