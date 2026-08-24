import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class SendTestWhatsAppDto {
  @ApiProperty({
    example: '+97333123456',
  })
  @IsString()
  @Matches(/^\+[1-9]\d{7,14}$/, {
    message:
      'Phone number must be in international format, for example +97333123456',
  })
  to: string;

  @ApiProperty({
    example: 'LIS-BH WhatsApp integration is working.',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  message: string;
}
