import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';

import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateLegalResourceDto } from './dto/create-legal-resource.dto';

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

    const maxFileSize = 25 * 1024 * 1024; // 25 MB

    if (file.size > maxFileSize) {
      throw new BadRequestException('PDF file must be 25 MB or smaller');
    }

    const filePath = `resources/${randomUUID()}.pdf`;

    await this.storage.uploadFile(filePath, file.buffer, file.mimetype);

    try {
      return await this.prisma.legalResource.create({
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
    } catch (error) {

      await this.storage.deleteFile(filePath);

      throw new InternalServerErrorException('Failed to create legal resource');
    }
  }
}
