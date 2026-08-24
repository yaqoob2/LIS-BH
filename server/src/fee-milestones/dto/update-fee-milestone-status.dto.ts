import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { FeeMilestoneStatus } from '../../generated/prisma/client';

export class UpdateFeeMilestoneStatusDto {
  @ApiProperty({
    enum: FeeMilestoneStatus,
    example: FeeMilestoneStatus.IN_PROGRESS,
  })
  @IsEnum(FeeMilestoneStatus)
  status: FeeMilestoneStatus;
}
