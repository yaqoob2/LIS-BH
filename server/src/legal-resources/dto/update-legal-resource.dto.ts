import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateLegalResourceDto {
  @ApiPropertyOptional({
    example: 'Bahrain Labour Law',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(250)
  title?: string;

  @ApiPropertyOptional({
    example: 'LAW',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  documentType?: string;

  @ApiPropertyOptional({
    example: 'Labour',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({
    example: 'Arabic',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  language?: string;

  @ApiPropertyOptional({
    example: 'Law No. 36 of 2012',
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  referenceNumber?: string;

  @ApiPropertyOptional({
    example: 2012,
  })
  @IsOptional()
  @IsInt()
  @Min(1800)
  @Type(() => Number)
  year?: number;

  @ApiPropertyOptional({
    example: 'Updated legal resource notes.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
