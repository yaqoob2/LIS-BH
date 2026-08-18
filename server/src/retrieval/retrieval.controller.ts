import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RetrievalService } from './retrieval.service';
import { SearchRetrievalDto } from './dto/search-retrieval.dto';

@ApiTags('Retrieval')
@ApiBearerAuth()
@Controller('retrieval')
@UseGuards(JwtAuthGuard)
export class RetrievalController {
  constructor(private readonly retrievalService: RetrievalService) {}

  @Post('search')
  search(@Body() dto: SearchRetrievalDto) {
    return this.retrievalService.search(dto.question, dto.limit ?? 5);
  }
}
