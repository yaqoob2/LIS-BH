import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../generated/prisma/client';
import { DeadlinesService } from './deadlines.service';
import { CreateDeadlineDto } from './dto/create-deadline.dto';
import { UpdateDeadlineDto } from './dto/update-deadline.dto';

type AuthenticatedRequest = Request & {
  user: {
    sub: string;
    role: UserRole;
  };
};

@ApiTags('Deadlines')
@ApiBearerAuth()
@Controller('deadlines')
@UseGuards(JwtAuthGuard)
export class DeadlinesController {
  constructor(private readonly deadlinesService: DeadlinesService) {}

  @Post()
  create(@Body() dto: CreateDeadlineDto, @Req() request: AuthenticatedRequest) {
    return this.deadlinesService.create(
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
    return this.deadlinesService.findByCase(
      caseId,
      request.user.sub,
      request.user.role,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDeadlineDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.deadlinesService.update(
      id,
      dto,
      request.user.sub,
      request.user.role,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.deadlinesService.remove(
      id,
      request.user.sub,
      request.user.role,
    );
  }
}
