import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { CasePartiesController } from './case-parties.controller';
import { CasePartiesService } from './case-parties.service';

@Module({
  imports: [AuthModule],
  controllers: [CasePartiesController],
  providers: [CasePartiesService],
  exports: [CasePartiesService],
})
export class CasePartiesModule {}
