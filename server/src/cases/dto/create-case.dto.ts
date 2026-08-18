import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Primary assigned lawyer/user ID',
  })
  @IsOptional()
  @IsString()
  assignedUserId?: string;
}
