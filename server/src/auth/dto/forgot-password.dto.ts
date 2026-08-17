import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'ahmed@lawfirm.com',
  })
  @IsEmail()
  email: string;
}
