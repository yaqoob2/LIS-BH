import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PdfModule } from '../pdf/pdf.module';
import { LegalResourcesController } from './legal-resources.controller';
import { LegalResourcesService } from './legal-resources.service';
import { PdfService } from '../pdf/pdf.service';
import { ChunkingModule } from '../chunking/chunking.module';
import { EmbeddingsModule } from '../embeddings/embeddings.module';

@Module({
  imports: [AuthModule, PdfModule, ChunkingModule, EmbeddingsModule],
  controllers: [LegalResourcesController],
  providers: [LegalResourcesService],
  exports: [LegalResourcesService],
})
export class LegalResourcesModule {}
