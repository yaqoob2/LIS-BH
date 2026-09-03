import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WhatsAppService {
  constructor(private readonly configService: ConfigService) {}

  async sendMessage(to: string, message: string) {
    try {
      const accessToken = this.configService.getOrThrow<string>(
        'META_WHATSAPP_ACCESS_TOKEN',
      );

      const phoneNumberId = this.configService.getOrThrow<string>(
        'META_WHATSAPP_PHONE_NUMBER_ID',
      );

      const apiVersion = this.configService.get<string>(
        'META_WHATSAPP_API_VERSION',
        'v26.0',
      );

      const recipient = to.replace(/\D/g, '');

      const response = await fetch(
        `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: recipient,
            type: 'text',
            text: {
              preview_url: true,
              body: message,
            },
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('Meta WhatsApp send failed:', data);

        throw new Error('Meta WhatsApp request failed');
      }

      return {
        success: true,
        messageId: data?.messages?.[0]?.id ?? null,
      };
    } catch (error) {
      console.error('WhatsApp send failed:', error);

      throw new InternalServerErrorException('Failed to send WhatsApp message');
    }
  }
}
