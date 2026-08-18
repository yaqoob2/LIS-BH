import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { EmbeddingsService } from '../embeddings/embeddings.service';

type SearchResult = {
  chunkId: string;
  legalResourceId: string;
  title: string;
  text: string;
  pageStart: number | null;
  pageEnd: number | null;
  sectionNumber: string | null;
  heading: string | null;
  similarity: number;
};

@Injectable()
export class RetrievalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddingsService: EmbeddingsService,
  ) {}

  async search(question: string, limit = 5): Promise<SearchResult[]> {
    const [embedding] = await this.embeddingsService.createEmbeddings([
      question,
    ]);

    const vector = `[${embedding.join(',')}]`;

    return this.prisma.$queryRaw<SearchResult[]>`
      SELECT
        lc."id" AS "chunkId",
        lc."legal_resource_id" AS "legalResourceId",
        lr."title",
        lc."text",
        lc."page_start" AS "pageStart",
        lc."page_end" AS "pageEnd",
        lc."section_number" AS "sectionNumber",
        lc."heading",
        1 - (lc."embedding" <=> ${vector}::vector) AS "similarity"
      FROM "legal_chunks" lc
      JOIN "legal_resources" lr
        ON lr."id" = lc."legal_resource_id"
      WHERE lc."embedding" IS NOT NULL
        AND lr."resource_status" = 'ACTIVE'
        AND lr."processing_status" = 'READY'
      ORDER BY lc."embedding" <=> ${vector}::vector
      LIMIT ${limit};
    `;
  }
}
