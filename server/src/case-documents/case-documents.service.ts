import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';

import * as mammoth from 'mammoth';

import { PdfService } from '../pdf/pdf.service';
import { DocumentProcessingStatus } from '../generated/prisma/client';

import { UserRole } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateCaseDocumentDto } from './dto/create-case-document.dto';
import { UpdateCaseDocumentDto } from './dto/update-case-document.dto';

@Injectable()
export class CaseDocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly pdfService: PdfService,
  ) {}

  private async checkCaseAccess(
    caseId: string,
    userId: string,
    userRole: UserRole,
  ) {
    const caseRecord = await this.prisma.case.findUnique({
      where: { id: caseId },
    });

    if (!caseRecord) {
      throw new NotFoundException('Case not found');
    }

    if (
      userRole !== UserRole.ADMIN &&
      caseRecord.createdById !== userId &&
      caseRecord.assignedUserId !== userId
    ) {
      throw new ForbiddenException('You do not have access to this case');
    }

    return caseRecord;
  }

  async create(
    dto: CreateCaseDocumentDto,
    file: Express.Multer.File,
    userId: string,
    userRole: UserRole,
  ) {
    await this.checkCaseAccess(dto.caseId, userId, userRole);

    if (!file) {
      throw new BadRequestException('Document file is required');
    }

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only PDF and DOCX files are allowed');
    }

    const maxFileSize = 25 * 1024 * 1024;

    if (file.size > maxFileSize) {
      throw new BadRequestException('Document must be 25 MB or smaller');
    }

    const extension = file.mimetype === 'application/pdf' ? 'pdf' : 'docx';

    const filePath = `${dto.caseId}/${randomUUID()}.${extension}`;

    await this.storage.uploadCaseDocument(filePath, file.buffer, file.mimetype);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const document = await tx.caseDocument.create({
          data: {
            caseId: dto.caseId,
            title: dto.title.trim(),
            documentType: dto.documentType.trim(),
            filePath,
            createdById: userId,
          },
        });

        await tx.auditLog.create({
          data: {
            userId,
            action: 'CASE_DOCUMENT_CREATED',
            entityType: 'CASE_DOCUMENT',
            entityId: document.id,
          },
        });

        return document;
      });
    } catch (error) {
      await this.storage.deleteCaseDocument(filePath);

      throw new InternalServerErrorException('Failed to create case document');
    }
  }
  async findByCase(caseId: string, userId: string, userRole: UserRole) {
    await this.checkCaseAccess(caseId, userId, userRole);

    return this.prisma.caseDocument.findMany({
      where: { caseId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string, userRole: UserRole) {
    const document = await this.prisma.caseDocument.findUnique({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException('Case document not found');
    }

    await this.checkCaseAccess(document.caseId, userId, userRole);

    return document;
  }

  async download(id: string, userId: string, userRole: UserRole) {
    const document = await this.findOne(id, userId, userRole);

    const buffer = await this.storage.downloadCaseDocument(document.filePath);

    return {
      document,
      buffer,
    };
  }

  async update(
    id: string,
    dto: UpdateCaseDocumentDto,
    userId: string,
    userRole: UserRole,
  ) {
    await this.findOne(id, userId, userRole);

    return this.prisma.$transaction(async (tx) => {
      const document = await tx.caseDocument.update({
        where: { id },
        data: {
          title: dto.title?.trim(),
          documentType: dto.documentType?.trim(),
          updatedById: userId,
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'CASE_DOCUMENT_UPDATED',
          entityType: 'CASE_DOCUMENT',
          entityId: id,
        },
      });

      return document;
    });
  }

  async remove(id: string, userId: string, userRole: UserRole) {
    const document = await this.findOne(id, userId, userRole);

    await this.storage.deleteCaseDocument(document.filePath);

    await this.prisma.$transaction(async (tx) => {
      await tx.auditLog.create({
        data: {
          userId,
          action: 'CASE_DOCUMENT_DELETED',
          entityType: 'CASE_DOCUMENT',
          entityId: id,
        },
      });

      await tx.caseDocument.delete({
        where: { id },
      });
    });

    return {
      message: 'Case document deleted successfully',
    };
  }
  async processDocument(id: string, userId: string, userRole: UserRole) {
    const document = await this.findOne(id, userId, userRole);

    await this.prisma.caseDocument.update({
      where: { id },
      data: {
        processingStatus: DocumentProcessingStatus.PROCESSING,
        processingError: null,
        updatedById: userId,
      },
    });

    try {
      const buffer = await this.storage.downloadCaseDocument(document.filePath);

      let extractedText = '';

      if (document.filePath.toLowerCase().endsWith('.pdf')) {
        extractedText = await this.pdfService.extractText(buffer);
      } else if (document.filePath.toLowerCase().endsWith('.docx')) {
        const result = await mammoth.extractRawText({
          buffer,
        });

        extractedText = result.value;
      } else {
        throw new Error('Unsupported document format');
      }

      extractedText = extractedText.trim();

      if (!extractedText) {
        throw new Error('No readable text was found in the document');
      }

      return this.prisma.$transaction(async (tx) => {
        const updated = await tx.caseDocument.update({
          where: { id },
          data: {
            extractedText,
            processingStatus: DocumentProcessingStatus.READY,
            processingError: null,
            updatedById: userId,
          },
        });

        await tx.auditLog.create({
          data: {
            userId,
            action: 'CASE_DOCUMENT_PROCESSED',
            entityType: 'CASE_DOCUMENT',
            entityId: id,
          },
        });

        return updated;
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Document processing failed';

      await this.prisma.caseDocument.update({
        where: { id },
        data: {
          processingStatus: DocumentProcessingStatus.FAILED,
          processingError: errorMessage,
          updatedById: userId,
        },
      });

      throw error;
    }
  }
}
