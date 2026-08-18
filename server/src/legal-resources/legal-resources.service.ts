import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';

import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateLegalResourceDto } from './dto/create-legal-resource.dto';
import { UpdateLegalResourceDto } from './dto/update-legal-resource.dto';
import { PdfService } from '../pdf/pdf.service';
import { ChunkingService } from '../chunking/chunking.service';
import { EmbeddingsService } from '../embeddings/embeddings.service';

@Injectable()
export class LegalResourcesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly pdfService: PdfService,
    private readonly chunkingService: ChunkingService,
    private readonly embeddingsService: EmbeddingsService,
  ) {}

  async create(
    dto: CreateLegalResourceDto,
    file: Express.Multer.File,
    userId: string,
  ) {
    if (!file) {
      throw new BadRequestException('PDF file is required');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Only PDF files are allowed');
    }

    const signature = file.buffer.subarray(0, 5).toString();

    if (signature !== '%PDF-') {
      throw new BadRequestException('Invalid PDF file');
    }

    const maxFileSize = 25 * 1024 * 1024;

    if (file.size > maxFileSize) {
      throw new BadRequestException('PDF file must be 25 MB or smaller');
    }

    const filePath = `resources/${randomUUID()}.pdf`;

    await this.storage.uploadFile(filePath, file.buffer, file.mimetype);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const resource = await tx.legalResource.create({
          data: {
            title: dto.title.trim(),
            documentType: dto.documentType.trim(),
            category: dto.category.trim(),
            language: dto.language.trim(),
            referenceNumber: dto.referenceNumber?.trim() || null,
            year: dto.year,
            notes: dto.notes?.trim() || null,
            filePath,
            createdById: userId,
          },
        });

        await tx.auditLog.create({
          data: {
            userId,
            action: 'LEGAL_RESOURCE_CREATED',
            entityType: 'LEGAL_RESOURCE',
            entityId: resource.id,
          },
        });

        return resource;
      });
    } catch (error) {
      console.error('LEGAL RESOURCE DB ERROR:', error);

      await this.storage.deleteFile(filePath);

      throw new InternalServerErrorException('Failed to create legal resource');
    }
  }

  async findAll() {
    return this.prisma.legalResource.findMany({
      where: {
        resourceStatus: 'ACTIVE',
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const resource = await this.prisma.legalResource.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!resource) {
      throw new NotFoundException('Legal resource not found');
    }

    return resource;
  }

  async update(id: string, dto: UpdateLegalResourceDto, userId: string) {
    await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      const resource = await tx.legalResource.update({
        where: { id },
        data: {
          title: dto.title?.trim(),
          documentType: dto.documentType?.trim(),
          category: dto.category?.trim(),
          language: dto.language?.trim(),

          referenceNumber:
            dto.referenceNumber !== undefined
              ? dto.referenceNumber.trim() || null
              : undefined,

          year: dto.year,

          notes: dto.notes !== undefined ? dto.notes.trim() || null : undefined,

          updatedById: userId,
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'LEGAL_RESOURCE_UPDATED',
          entityType: 'LEGAL_RESOURCE',
          entityId: resource.id,
        },
      });

      return resource;
    });
  }

  async archive(id: string, userId: string) {
    await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      const resource = await tx.legalResource.update({
        where: { id },
        data: {
          resourceStatus: 'ARCHIVED',
          updatedById: userId,
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'LEGAL_RESOURCE_ARCHIVED',
          entityType: 'LEGAL_RESOURCE',
          entityId: resource.id,
        },
      });

      return resource;
    });
  }

  async findArchived() {
    return this.prisma.legalResource.findMany({
      where: {
        resourceStatus: 'ARCHIVED',
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async restore(id: string, userId: string) {
    const existing = await this.findOne(id);

    if (existing.resourceStatus !== 'ARCHIVED') {
      throw new BadRequestException('Only archived resources can be restored');
    }

    return this.prisma.$transaction(async (tx) => {
      const resource = await tx.legalResource.update({
        where: { id },
        data: {
          resourceStatus: 'ACTIVE',
          updatedById: userId,
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'LEGAL_RESOURCE_RESTORED',
          entityType: 'LEGAL_RESOURCE',
          entityId: resource.id,
        },
      });

      return resource;
    });
  }

  async permanentDelete(id: string, userId: string) {
    const resource = await this.findOne(id);

    if (resource.resourceStatus !== 'ARCHIVED') {
      throw new BadRequestException(
        'Resource must be archived before permanent deletion',
      );
    }

    await this.storage.deleteFile(resource.filePath);

    await this.prisma.$transaction(async (tx) => {
      await tx.auditLog.create({
        data: {
          userId,
          action: 'LEGAL_RESOURCE_PERMANENTLY_DELETED',
          entityType: 'LEGAL_RESOURCE',
          entityId: resource.id,
        },
      });

      await tx.legalResource.delete({
        where: { id },
      });
    });

    return {
      message: 'Legal resource permanently deleted',
    };
  }

  async extractText(id: string) {
    const resource = await this.findOne(id);

    const fileBuffer = await this.storage.downloadFile(resource.filePath);

    const text = await this.pdfService.extractText(fileBuffer);

    if (!text.trim()) {
      throw new BadRequestException('No readable text found in PDF');
    }

    return {
      resourceId: resource.id,
      textLength: text.length,
      text,
    };
  }
  async processChunks(id: string, userId: string) {
    const resource = await this.findOne(id);

    await this.prisma.legalResource.update({
      where: { id },
      data: {
        processingStatus: 'PROCESSING',
        processingError: null,
        updatedById: userId,
      },
    });

    try {
      const fileBuffer = await this.storage.downloadFile(resource.filePath);

      const pages = await this.pdfService.extractPages(fileBuffer);

      const chunks = this.chunkingService.chunkPages(pages);

      if (chunks.length === 0) {
        throw new BadRequestException('No readable text found in PDF');
      }

      await this.prisma.$transaction(async (tx) => {
        // Safe if we process the same PDF again
        await tx.legalChunk.deleteMany({
          where: {
            legalResourceId: id,
          },
        });

        await tx.legalChunk.createMany({
          data: chunks.map((chunk, index) => ({
            legalResourceId: id,
            chunkIndex: index,
            text: chunk.text,
            pageStart: chunk.pageStart,
            pageEnd: chunk.pageEnd,
            sectionNumber: chunk.sectionNumber,
            heading: chunk.heading,
          })),
        });

        await tx.auditLog.create({
          data: {
            userId,
            action: 'LEGAL_RESOURCE_CHUNKED',
            entityType: 'LEGAL_RESOURCE',
            entityId: id,
          },
        });
      });

      return {
        resourceId: id,
        pages: pages.length,
        chunks: chunks.length,
        status: 'PROCESSING',
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'PDF processing failed';

      await this.prisma.legalResource.update({
        where: { id },
        data: {
          processingStatus: 'FAILED',
          processingError: message,
          updatedById: userId,
        },
      });

      throw error;
    }
  }
  async processEmbeddings(id: string, userId: string) {
    await this.findOne(id);

    try {
      const chunks = await this.prisma.legalChunk.findMany({
        where: {
          legalResourceId: id,
        },
        orderBy: {
          chunkIndex: 'asc',
        },
        select: {
          id: true,
          text: true,
        },
      });

      if (chunks.length === 0) {
        throw new BadRequestException(
          'No chunks found. Process the PDF chunks first.',
        );
      }

      const batchSize = 50;
      const embeddings: number[][] = [];

      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);

        const batchEmbeddings = await this.embeddingsService.createEmbeddings(
          batch.map((chunk) => chunk.text),
        );

        embeddings.push(...batchEmbeddings);
      }

      await this.prisma.$transaction(async (tx) => {
        for (let i = 0; i < chunks.length; i++) {
          const vector = `[${embeddings[i].join(',')}]`;

          await tx.$executeRaw`
          UPDATE "legal_chunks"
          SET "embedding" = ${vector}::vector
          WHERE "id" = ${chunks[i].id}::uuid
        `;
        }

        await tx.legalResource.update({
          where: { id },
          data: {
            processingStatus: 'READY',
            processingError: null,
            updatedById: userId,
          },
        });

        await tx.auditLog.create({
          data: {
            userId,
            action: 'LEGAL_RESOURCE_EMBEDDED',
            entityType: 'LEGAL_RESOURCE',
            entityId: id,
          },
        });
      });

      return {
        resourceId: id,
        chunksEmbedded: chunks.length,
        status: 'READY',
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Embedding processing failed';

      await this.prisma.legalResource.update({
        where: { id },
        data: {
          processingStatus: 'FAILED',
          processingError: message,
          updatedById: userId,
        },
      });

      throw error;
    }
  }
  async processResource(id: string, userId: string) {
    await this.processChunks(id, userId);

    const result = await this.processEmbeddings(id, userId);

    return {
      resourceId: id,
      status: result.status,
      chunksEmbedded: result.chunksEmbedded,
      message: 'Legal resource processed successfully',
    };
  }
}
