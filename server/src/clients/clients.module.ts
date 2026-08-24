import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { ClientIdentityService } from './client-identity.service';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';

@Module({
  imports: [AuthModule],
  controllers: [ClientsController],
  providers: [ClientsService, ClientIdentityService],
  exports: [ClientsService, ClientIdentityService],
})
export class ClientsModule {}
