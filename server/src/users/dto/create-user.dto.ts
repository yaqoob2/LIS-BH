import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../generated/prisma/client';
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'Ahmed Ali',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'ahmed@lawfirm.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'StrongPass123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.USER,
  })
  @IsEnum(UserRole)
  role: UserRole;
}
