import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './storage/storage.module';
import { LegalResourcesModule } from './legal-resources/legal-resources.module';
import { RetrievalModule } from './retrieval/retrieval.module';
import { AiModule } from './ai/ai.module';
import { CasesModule } from './cases/cases.module';
import { CasePartiesModule } from './case-parties/case-parties.module';
import { CaseDocumentsModule } from './case-documents/case-documents.module';
import { DeadlinesModule } from './deadlines/deadlines.module';
import { AiConversationsModule } from './ai-conversations/ai-conversations.module';
import { ClientsModule } from './clients/clients.module';
import { FeeMilestonesModule } from './fee-milestones/fee-milestones.module';
import { ClientPortalModule } from './client-portal/client-portal.module';
import { WhatsAppModule } from './whatsapp/whatsapp.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    StorageModule,
    LegalResourcesModule,
    RetrievalModule,
    AiModule,
    CasesModule,
    CasePartiesModule,
    CaseDocumentsModule,
    DeadlinesModule,
    AiConversationsModule,
    ClientsModule,
    FeeMilestonesModule,
    ClientPortalModule,
    WhatsAppModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
