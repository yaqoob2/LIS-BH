import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SearchRetrievalDto {
  @ApiProperty({
    example: 'What are the employee annual leave requirements?',
  })
  @IsString()
  @MinLength(3)
  question: string;

  @ApiPropertyOptional({
    example: 5,
    default: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  limit?: number;
}
