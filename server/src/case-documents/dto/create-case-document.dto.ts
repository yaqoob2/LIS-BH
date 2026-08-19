import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateCaseDocumentDto {
  @ApiProperty({
    example: '344f68de-8748-4824-96e2-ecebe36c6092',
  })
  @IsUUID()
  caseId: string;

  @ApiProperty({
    example: 'Employment Contract',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(250)
  title: string;

  @ApiProperty({
    example: 'Contract',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  documentType: string;
}
