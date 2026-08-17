import { Module } from '@nestjs/common';
import { LegalResourcesController } from './legal-resources.controller';
import { LegalResourcesService } from './legal-resources.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [LegalResourcesController],
  providers: [LegalResourcesService],
  exports: [LegalResourcesService],
})
export class LegalResourcesModule {}
