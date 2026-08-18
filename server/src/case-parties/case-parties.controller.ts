import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../generated/prisma/client';
import { CasePartiesService } from './case-parties.service';
import { CreateCasePartyDto } from './dto/create-case-party.dto';
import { UpdateCasePartyDto } from './dto/update-case-party.dto';

type AuthenticatedRequest = Request & {
  user: {
    sub: string;
    role: UserRole;
  };
};

@ApiTags('Case Parties')
@ApiBearerAuth()
@Controller('case-parties')
@UseGuards(JwtAuthGuard)
export class CasePartiesController {
  constructor(private readonly casePartiesService: CasePartiesService) {}

  @Post()
  create(
    @Body() dto: CreateCasePartyDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.casePartiesService.create(
      dto,
      request.user.sub,
      request.user.role,
    );
  }

  @Get('case/:caseId')
  findByCase(
    @Param('caseId') caseId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.casePartiesService.findByCase(
      caseId,
      request.user.sub,
      request.user.role,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCasePartyDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.casePartiesService.update(
      id,
      dto,
      request.user.sub,
      request.user.role,
    );
  }
  @Delete(':id')
  remove(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.casePartiesService.remove(
      id,
      request.user.sub,
      request.user.role,
    );
  }
}
