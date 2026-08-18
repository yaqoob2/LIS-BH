import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../generated/prisma/client';
import { CasesService } from './cases.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AssignCaseDto } from './dto/assign-case.dto';

type AuthenticatedRequest = Request & {
  user: {
    sub: string;
    email: string;
    role: UserRole;
    tokenVersion: number;
  };
};

@ApiTags('Cases')
@ApiBearerAuth()
@Controller('cases')
@UseGuards(JwtAuthGuard)
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Post()
  create(@Body() dto: CreateCaseDto, @Req() request: AuthenticatedRequest) {
    return this.casesService.create(dto, request.user.sub, request.user.role);
  }
  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.casesService.findAll(request.user.sub, request.user.role);
  }
  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.casesService.findOne(id, request.user.sub, request.user.role);
  }
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCaseDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.casesService.update(
      id,
      dto,
      request.user.sub,
      request.user.role,
    );
  }
  @Patch(':id/claim')
  claim(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.casesService.claim(id, request.user.sub);
  }
  @Patch(':id/assign')
  @UseGuards(JwtAuthGuard, AdminGuard)
  assign(
    @Param('id') id: string,
    @Body() dto: AssignCaseDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.casesService.assign(id, dto.assignedUserId, request.user.sub);
  }
}
