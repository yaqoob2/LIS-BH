import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

import { RetrievalService } from '../retrieval/retrieval.service';

type ChatHistoryItem = {
  role: 'USER' | 'ASSISTANT';
  content: string;
};

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

  private isInScope(
    question: string,
    history: ChatHistoryItem[] = [],
  ): boolean {
    const text = question.toLowerCase();

    const allowedKeywords = [
      // English
      'law',
      'legal',
      'court',
      'case',
      'contract',
      'agreement',
      'employee',
      'employer',
      'employment',
      'labour',
      'labor',
      'claim',
      'claimant',
      'defendant',
      'plaintiff',
      'deadline',
      'hearing',
      'appeal',
      'judgment',
      'regulation',
      'article',
      'statute',
      'legislation',
      'evidence',
      'party',
      'lawyer',
      'attorney',
      'compliance',
      'clause',
      'liability',
      'breach',
      'damages',
      'rights',
      'obligation',
      'termination',
      'notice period',
      'annual leave',
      'salary',
      'dispute',

      // Arabic
      'قانون',
      'قانوني',
      'قانونية',
      'محكمة',
      'قضية',
      'عقد',
      'اتفاقية',
      'موظف',
      'عامل',
      'صاحب العمل',
      'عمل',
      'دعوى',
      'مدعي',
      'مدعى عليه',
      'استئناف',
      'حكم',
      'لائحة',
      'تشريع',
      'مادة',
      'دليل',
      'إثبات',
      'محامي',
      'امتثال',
      'التزام',
      'حقوق',
      'تعويض',
      'إنهاء',
      'إشعار',
      'راتب',
      'إجازة',
      'نزاع',
    ];

    const directlyInScope = allowedKeywords.some((keyword) =>
      text.includes(keyword),
    );

    if (directlyInScope) {
      return true;
    }

    // Allow short follow-up questions inside an existing legal chat.
    if (history.length > 0) {
      const followUpPatterns = [
        'what about',
        'what if',
        'why',
        'how',
        'explain',
        'clarify',
        'and this',
        'and that',
        'does this',
        'can they',
        'can he',
        'can she',
        'what does this mean',
        'ماذا عن',
        'ماذا لو',
        'لماذا',
        'كيف',
        'اشرح',
        'وضح',
        'هل يمكن',
      ];

      return followUpPatterns.some((pattern) => text.includes(pattern));
    }

    return false;
  }

  async ask(
    question: string,
    history: ChatHistoryItem[] = [],
    caseContext = '',
  ) {
    const cleanQuestion = question.trim();

    if (!this.isInScope(cleanQuestion, history)) {
      return {
        answer:
          'I can only assist with legal research, legal resources, cases, case documents, deadlines, parties, and other legal work within this system.',
        sources: [],
      };
    }

    const sources = await this.retrievalService.search(cleanQuestion, 5);

    if (sources.length === 0 && !caseContext.trim()) {
      return {
        answer:
          'I could not find sufficient information in the available legal resources to answer this question.',
        sources: [],
      };
    }

    const legalContext = sources
      .map(
        (source, index) =>
          `[Source ${index + 1}]
Document: ${source.title}
Page: ${source.pageStart ?? 'Unknown'}
Section: ${source.sectionNumber ?? 'Unknown'}
Heading: ${source.heading ?? 'Unknown'}

${source.text}`,
      )
      .join('\n\n');

    const conversationHistory = history
      .slice(-8)
      .map(
        (message) =>
          `${
            message.role === 'USER' ? 'User' : 'Assistant'
          }: ${message.content}`,
      )
      .join('\n');

    const response = await this.openai.responses.create({
      model: 'gpt-5.6-terra',
      reasoning: {
        effort: 'low',
      },
      input: `
You are the legal AI assistant for LIS-BH.

YOUR SCOPE:
You may only assist with:
- legal research
- laws and regulations
- uploaded legal resources
- legal cases
- case documents
- case parties
- case deadlines
- legal analysis
- legal drafting related to the user's legal work

Do not assist with unrelated general-purpose requests.

GROUNDING RULES:
- Answer using ONLY the legal sources provided below.
- Do not invent laws, articles, facts, cases, or citations.
- If the provided sources are insufficient, clearly say so.
- Preserve important article, section, document, and page references when available.
- Use the conversation history only to understand the current question.
- Conversation history is NOT a legal source.

CONVERSATION HISTORY:
${conversationHistory || 'No previous conversation.'}

CURRENT QUESTION:
${cleanQuestion}
CASE CONTEXT:
${caseContext || 'No case is linked to this conversation.'}

IMPORTANT CASE RULES:
- Case context contains facts and information about the user's case.
- Case context is NOT legal authority.
- You may use case context to understand and analyse the case.
- Legal conclusions must be supported by the provided legal sources.
- Do not invent missing case facts.
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
