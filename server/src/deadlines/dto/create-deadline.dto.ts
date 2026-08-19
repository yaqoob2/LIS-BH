import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

import { DeadlineStatus } from '../../generated/prisma/client';

export class CreateDeadlineDto {
  @ApiProperty()
  @IsUUID()
  caseId: string;

  @ApiProperty({
    example: 'Submit response to court',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(250)
  title: string;

  @ApiProperty({
    example: 'Court Filing',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  deadlineType: string;

  @ApiProperty({
    example: '2026-09-15T10:00:00.000Z',
  })
  @IsDateString()
  dueDate: string;

  @ApiPropertyOptional({
    enum: DeadlineStatus,
    default: DeadlineStatus.OPEN,
  })
  @IsOptional()
  @IsEnum(DeadlineStatus)
  status?: DeadlineStatus;
}
