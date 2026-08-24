import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';

import { AccessClientPortalDto } from './dto/access-client-portal.dto';
import { ClientPortalService } from './client-portal.service';
import { ClientPortalGuard } from './guards/client-portal.guard';
import type { ClientPortalJwtPayload } from './types/client-portal-jwt-payload.type';

type StaffRequest = Request & {
  user: JwtPayload;
};

type PortalRequest = Request & {
  portalClient: ClientPortalJwtPayload;
};

@ApiTags('Client Portal')
@Controller('client-portal')
export class ClientPortalController {
  constructor(private readonly clientPortalService: ClientPortalService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Create client portal link',
  })
  @Post('clients/:clientId/magic-link')
  createMagicLink(
    @Param('clientId', new ParseUUIDPipe())
    clientId: string,
    @Req() request: StaffRequest,
  ) {
    return this.clientPortalService.createMagicLink(clientId, request.user.sub);
  }

  @ApiOperation({
    summary: 'Open client portal link',
  })
  @Post('access')
  access(@Body() dto: AccessClientPortalDto) {
    return this.clientPortalService.access(dto.token);
  }

  @ApiBearerAuth()
  @UseGuards(ClientPortalGuard)
  @ApiOperation({
    summary: 'Get client portal',
  })
  @Get('me')
  getPortal(@Req() request: PortalRequest) {
    return this.clientPortalService.getPortal(request.portalClient.sub);
  }
}
