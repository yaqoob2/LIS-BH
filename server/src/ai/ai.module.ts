import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { RetrievalModule } from '../retrieval/retrieval.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  imports: [AuthModule, RetrievalModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
