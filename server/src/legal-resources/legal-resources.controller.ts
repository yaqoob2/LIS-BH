import {
  BadRequestException,
  Controller,
  Post,
  Body,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { LegalResourcesService } from './legal-resources.service';
import { CreateLegalResourceDto } from './dto/create-legal-resource.dto';

type AuthenticatedRequest = Request & {
  user: {
    sub: string;
  };
};

@ApiTags('Legal Resources')
@ApiBearerAuth()
@Controller('legal-resources')
export class LegalResourcesController {
  constructor(private readonly legalResourcesService: LegalResourcesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['title', 'documentType', 'category', 'language', 'file'],
      properties: {
        title: { type: 'string' },
        documentType: { type: 'string' },
        category: { type: 'string' },
        language: { type: 'string' },
        referenceNumber: { type: 'string' },
        year: { type: 'integer' },
        notes: { type: 'string' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  create(
    @Body() dto: CreateLegalResourceDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.legalResourcesService.create(dto, file, request.user.sub);
  }
}
