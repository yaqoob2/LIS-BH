import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { CaseDocumentsController } from './case-documents.controller';
import { CaseDocumentsService } from './case-documents.service';
import { PdfModule } from '../pdf/pdf.module';

@Module({
  imports: [AuthModule, PdfModule],
  controllers: [CaseDocumentsController],
  providers: [CaseDocumentsService],
  exports: [CaseDocumentsService],
})
export class CaseDocumentsModule {}
