import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class AskAiDto {
  @ApiProperty({
    example: 'What does the law say about annual leave?',
  })
  @IsString()
  @MinLength(3)
  question: string;
}
