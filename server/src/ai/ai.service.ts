import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

import { RetrievalService } from '../retrieval/retrieval.service';

@Injectable()
export class AiService {
  private readonly openai: OpenAI;

  constructor(
    private readonly configService: ConfigService,
    private readonly retrievalService: RetrievalService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.getOrThrow<string>('OPENAI_API_KEY'),
    });
  }

  async ask(question: string) {
    const sources = await this.retrievalService.search(question, 5);

    const legalContext = sources
      .map(
        (source, index) =>
          `[Source ${index + 1}]
Document: ${source.title}
Page: ${source.pageStart ?? 'Unknown'}
Section: ${source.sectionNumber ?? 'Unknown'}

${source.text}`,
      )
      .join('\n\n');

    const response = await this.openai.responses.create({
      model: 'gpt-5.6-terra',
      reasoning: {
        effort: 'low',
      },
      input: `
You are a legal research assistant.

Answer the user's question using ONLY the legal sources provided below.

If the sources do not contain enough information, clearly say so.
Do not invent laws, articles, facts, or citations.

QUESTION:
${question}

LEGAL SOURCES:
${legalContext}
      `,
    });

    return {
      answer: response.output_text,
      sources,
    };
  }
}
