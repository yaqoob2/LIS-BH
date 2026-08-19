import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { DeadlinesController } from './deadlines.controller';
import { DeadlinesService } from './deadlines.service';

@Module({
  imports: [AuthModule],
  controllers: [DeadlinesController],
  providers: [DeadlinesService],
  exports: [DeadlinesService],
})
export class DeadlinesModule {}
