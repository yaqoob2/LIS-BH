import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio from 'twilio';

@Injectable()
export class WhatsAppService {
  private readonly client;

  constructor(private readonly configService: ConfigService) {
    const accountSid =
      this.configService.getOrThrow<string>('TWILIO_ACCOUNT_SID');

    const authToken =
      this.configService.getOrThrow<string>('TWILIO_AUTH_TOKEN');

    this.client = twilio(accountSid, authToken);
  }

  async sendMessage(to: string, message: string) {
    try {
      const from = this.configService.getOrThrow<string>(
        'TWILIO_WHATSAPP_FROM',
      );

      const result = await this.client.messages.create({
        from,
        to: `whatsapp:${to}`,
        body: message,
      });

      return {
        success: true,
        messageSid: result.sid,
        status: result.status,
      };
    } catch (error) {
      console.error('WhatsApp send failed:', error);

      throw new InternalServerErrorException('Failed to send WhatsApp message');
    }
  }
}
