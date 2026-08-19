import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateCaseDocumentDto {
  @ApiPropertyOptional({
    example: 'Updated Employment Contract',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(250)
  title?: string;

  @ApiPropertyOptional({
    example: 'Contract',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  documentType?: string;
}
