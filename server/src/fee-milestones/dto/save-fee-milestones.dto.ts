import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SaveFeeMilestoneItemDto {
  @ApiProperty({
    example: 'Initial Case Review',
  })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    example: 'Review of the case information and available documents.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    example: '180.000',
  })
  @IsString()
  @Matches(/^\d+(\.\d{1,3})?$/, {
    message: 'Amount must be a positive number with up to 3 decimal places',
  })
  amount: string;
}

export class SaveFeeMilestonesDto {
  @ApiProperty({
    type: [SaveFeeMilestoneItemDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => SaveFeeMilestoneItemDto)
  milestones: SaveFeeMilestoneItemDto[];
}
