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

@Injectable()
export class LegalResourcesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
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
}
