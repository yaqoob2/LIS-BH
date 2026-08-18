import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
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
import { UpdateLegalResourceDto } from './dto/update-legal-resource.dto';

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

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.legalResourcesService.findAll();
  }

  @Get('archived')
  @UseGuards(JwtAuthGuard, AdminGuard)
  findArchived() {
    return this.legalResourcesService.findArchived();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.legalResourcesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateLegalResourceDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.legalResourcesService.update(id, dto, request.user.sub);
  }

  @Patch(':id/archive')
  @UseGuards(JwtAuthGuard, AdminGuard)
  archive(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.legalResourcesService.archive(id, request.user.sub);
  }

  @Patch(':id/restore')
  @UseGuards(JwtAuthGuard, AdminGuard)
  restore(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.legalResourcesService.restore(id, request.user.sub);
  }

  @Delete(':id/permanent')
  @UseGuards(JwtAuthGuard, AdminGuard)
  permanentDelete(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.legalResourcesService.permanentDelete(id, request.user.sub);
  }
}
