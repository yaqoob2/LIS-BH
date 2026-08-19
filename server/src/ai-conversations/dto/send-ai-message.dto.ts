import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class SendAiMessageDto {
  @ApiProperty({
    example: 'What does the labour law say about annual leave?',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(10000)
  message: string;
}
