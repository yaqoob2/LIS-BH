import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';

import { SaveFeeMilestonesDto } from './dto/save-fee-milestones.dto';
import { UpdateFeeMilestoneStatusDto } from './dto/update-fee-milestone-status.dto';
import { FeeMilestonesService } from './fee-milestones.service';

type AuthenticatedRequest = Request & {
  user: JwtPayload;
};

@ApiTags('Fee Milestones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('fee-milestones')
export class FeeMilestonesController {
  constructor(private readonly feeMilestonesService: FeeMilestonesService) {}

  @ApiOperation({
    summary: 'Generate AI milestone suggestions',
  })
  @Post('case/:caseId/suggest')
  suggest(
    @Param('caseId') caseId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.feeMilestonesService.suggest(
      caseId,
      request.user.sub,
      request.user.role,
    );
  }

  @ApiOperation({
    summary: 'Approve and save fee milestones',
  })
  @Put('case/:caseId')
  saveApproved(
    @Param('caseId') caseId: string,
    @Body() dto: SaveFeeMilestonesDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.feeMilestonesService.saveApproved(
      caseId,
      dto,
      request.user.sub,
      request.user.role,
    );
  }

  @ApiOperation({
    summary: 'Get approved fee milestones',
  })
  @Get('case/:caseId')
  findByCase(
    @Param('caseId') caseId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.feeMilestonesService.findByCase(
      caseId,
      request.user.sub,
      request.user.role,
    );
  }

  @ApiOperation({
    summary: 'Update fee milestone progress status',
  })
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateFeeMilestoneStatusDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.feeMilestonesService.updateStatus(
      id,
      dto.status,
      request.user.sub,
      request.user.role,
    );
  }
}
