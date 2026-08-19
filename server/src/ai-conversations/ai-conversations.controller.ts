import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../generated/prisma/client';
import { AiConversationsService } from './ai-conversations.service';
import { CreateAiConversationDto } from './dto/create-ai-conversation.dto';
import { SendAiMessageDto } from './dto/send-ai-message.dto';

type AuthenticatedRequest = Request & {
  user: {
    sub: string;
    role: UserRole;
  };
};

@ApiTags('AI Conversations')
@ApiBearerAuth()
@Controller('ai-conversations')
@UseGuards(JwtAuthGuard)
export class AiConversationsController {
  constructor(
    private readonly aiConversationsService: AiConversationsService,
  ) {}

  @Post()
  create(
    @Body() dto: CreateAiConversationDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.aiConversationsService.create(
      dto,
      request.user.sub,
      request.user.role,
    );
  }

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.aiConversationsService.findAll(request.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.aiConversationsService.findOne(
      id,
      request.user.sub,
      request.user.role,
    );
  }

  @Post(':id/messages')
  sendMessage(
    @Param('id') id: string,
    @Body() dto: SendAiMessageDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.aiConversationsService.sendMessage(
      id,
      dto.message,
      request.user.sub,
      request.user.role,
    );
  }
}
