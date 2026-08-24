import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthModule } from '../auth/auth.module';

import { ClientPortalController } from './client-portal.controller';
import { ClientPortalService } from './client-portal.service';
import { ClientPortalGuard } from './guards/client-portal.guard';

@Module({
  imports: [AuthModule, JwtModule.register({})],

  controllers: [ClientPortalController],

  providers: [ClientPortalService, ClientPortalGuard],

  exports: [ClientPortalService],
})
export class ClientPortalModule {}
