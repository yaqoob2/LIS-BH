import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { CasesModule } from '../cases/cases.module';
import { ClientPortalModule } from '../client-portal/client-portal.module';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';

import { FeeMilestonesController } from './fee-milestones.controller';
import { FeeMilestonesService } from './fee-milestones.service';

@Module({
  imports: [AuthModule, CasesModule, ClientPortalModule, WhatsAppModule],

  controllers: [FeeMilestonesController],

  providers: [FeeMilestonesService],

  exports: [FeeMilestonesService],
})
export class FeeMilestonesModule {}
