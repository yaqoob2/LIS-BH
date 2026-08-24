import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class AccessClientPortalDto {
  @ApiProperty({
    description: 'One-time secure portal token',
  })
  @IsString()
  @MinLength(20)
  token: string;
}
