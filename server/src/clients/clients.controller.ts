import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

type AuthenticatedRequest = Request & {
  user: JwtPayload;
};

@ApiTags('Clients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @ApiOperation({
    summary: 'Create a client or reuse an existing client',
  })
  @Post()
  create(@Body() dto: CreateClientDto, @Req() request: AuthenticatedRequest) {
    return this.clientsService.createOrReuse(dto, request.user.sub);
  }

  @ApiOperation({
    summary: 'List clients',
  })
  @Get()
  findAll() {
    return this.clientsService.findAll();
  }

  @ApiOperation({
    summary: 'Get client and their cases',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id);
  }

  @ApiOperation({
    summary: 'Update client',
  })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateClientDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.clientsService.update(id, dto, request.user.sub);
  }
}
