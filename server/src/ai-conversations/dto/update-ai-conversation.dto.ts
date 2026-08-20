import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateAiConversationDto {
  @ApiProperty({
    example: 'Phishing Incident Legal Actions',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(250)
  title: string;
}
