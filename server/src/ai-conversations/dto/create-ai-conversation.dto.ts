import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAiConversationDto {
  @ApiPropertyOptional({
    example: 'Employment Case Research',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(250)
  title?: string;

  @ApiPropertyOptional({
    description: 'Leave empty for General Chat',
  })
  @IsOptional()
  @IsUUID()
  caseId?: string;
}
