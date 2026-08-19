import { Module } from '@nestjs/common';

import { AiModule } from '../ai/ai.module';
import { AuthModule } from '../auth/auth.module';
import { AiConversationsController } from './ai-conversations.controller';
import { AiConversationsService } from './ai-conversations.service';

@Module({
  imports: [AuthModule, AiModule],
  controllers: [AiConversationsController],
  providers: [AiConversationsService],
  exports: [AiConversationsService],
})
export class AiConversationsModule {}
