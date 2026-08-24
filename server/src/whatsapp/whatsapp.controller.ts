import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SendTestWhatsAppDto } from './dto/send-test-whatsapp.dto';
import { WhatsAppService } from './whatsapp.service';

@ApiTags('WhatsApp')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('whatsapp')
export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsAppService) {}

  @ApiOperation({
    summary: 'Send a test WhatsApp message',
  })
  @Post('test')
  test(@Body() dto: SendTestWhatsAppDto) {
    return this.whatsappService.sendMessage(dto.to, dto.message);
  }
}
