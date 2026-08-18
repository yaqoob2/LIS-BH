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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
