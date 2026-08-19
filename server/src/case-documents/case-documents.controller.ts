import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../generated/prisma/client';
import { CaseDocumentsService } from './case-documents.service';
import { CreateCaseDocumentDto } from './dto/create-case-document.dto';
import { UpdateCaseDocumentDto } from './dto/update-case-document.dto';

type AuthenticatedRequest = Request & {
  user: {
    sub: string;
    role: UserRole;
  };
};

@ApiTags('Case Documents')
@ApiBearerAuth()
@Controller('case-documents')
@UseGuards(JwtAuthGuard)
export class CaseDocumentsController {
  constructor(private readonly caseDocumentsService: CaseDocumentsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['caseId', 'title', 'documentType', 'file'],
      properties: {
        caseId: { type: 'string' },
        title: { type: 'string' },
        documentType: { type: 'string' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  create(
    @Body() dto: CreateCaseDocumentDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.caseDocumentsService.create(
      dto,
      file,
      request.user.sub,
      request.user.role,
    );
  }

  @Get('case/:caseId')
  findByCase(
    @Param('caseId') caseId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.caseDocumentsService.findByCase(
      caseId,
      request.user.sub,
      request.user.role,
    );
  }

  @Get(':id/download')
  async download(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { document, buffer } = await this.caseDocumentsService.download(
      id,
      request.user.sub,
      request.user.role,
    );

    const isPdf = document.filePath.endsWith('.pdf');

    response.setHeader(
      'Content-Type',
      isPdf
        ? 'application/pdf'
        : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );

    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${document.title}.${isPdf ? 'pdf' : 'docx'}"`,
    );

    return new StreamableFile(buffer);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.caseDocumentsService.findOne(
      id,
      request.user.sub,
      request.user.role,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCaseDocumentDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.caseDocumentsService.update(
      id,
      dto,
      request.user.sub,
      request.user.role,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.caseDocumentsService.remove(
      id,
      request.user.sub,
      request.user.role,
    );
  }

  @Post(':id/process')
  processDocument(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.caseDocumentsService.processDocument(
      id,
      request.user.sub,
      request.user.role,
    );
  }
}
