import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class AssignCaseDto {
  @ApiProperty({
    nullable: true,
    example: 'user-uuid-here',
    description: 'User ID, or null to unassign the case',
  })
  @IsOptional()
  @IsUUID()
  assignedUserId?: string | null;
}
