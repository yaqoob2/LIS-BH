import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { AiService } from '../ai/ai.service';
import { UserRole } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAiConversationDto } from './dto/create-ai-conversation.dto';

@Injectable()
export class AiConversationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  private async checkCaseAccess(
    caseId: string,
    userId: string,
    userRole: UserRole,
  ) {
    const caseRecord = await this.prisma.case.findUnique({
      where: { id: caseId },
    });

    if (!caseRecord) {
      throw new NotFoundException('Case not found');
    }

    if (
      userRole !== UserRole.ADMIN &&
      caseRecord.createdById !== userId &&
      caseRecord.assignedUserId !== userId
    ) {
      throw new ForbiddenException('You do not have access to this case');
    }

    return caseRecord;
  }

  private createAutomaticTitle(message: string) {
    const clean = message.replace(/\s+/g, ' ').trim();

    if (clean.length <= 60) {
      return clean;
    }

    return `${clean.slice(0, 57).trim()}...`;
  }

  async create(
    dto: CreateAiConversationDto,
    userId: string,
    userRole: UserRole,
  ) {
    if (dto.caseId) {
      await this.checkCaseAccess(dto.caseId, userId, userRole);
    }

    return this.prisma.aiConversation.create({
      data: {
        userId,
        caseId: dto.caseId || null,
        title:
          dto.title?.trim() ||
          (dto.caseId ? 'Case AI Conversation' : 'General AI Conversation'),
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.aiConversation.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        case: {
          select: {
            id: true,
            referenceNumber: true,
            title: true,
          },
        },
      },
    });
  }

  async findOne(id: string, userId: string, userRole: UserRole) {
    const conversation = await this.prisma.aiConversation.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        case: {
          select: {
            id: true,
            referenceNumber: true,
            title: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            citations: true,
          },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('AI conversation not found');
    }

    if (conversation.caseId) {
      await this.checkCaseAccess(conversation.caseId, userId, userRole);
    }

    return conversation;
  }

  async update(id: string, title: string, userId: string, userRole: UserRole) {
    await this.findOne(id, userId, userRole);

    return this.prisma.aiConversation.update({
      where: {
        id,
      },
      data: {
        title: title.trim(),
      },
      include: {
        case: {
          select: {
            id: true,
            referenceNumber: true,
            title: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string, userRole: UserRole) {
    await this.findOne(id, userId, userRole);

    await this.prisma.aiConversation.delete({
      where: {
        id,
      },
    });

    return {
      message: 'AI conversation deleted successfully',
    };
  }

  private async buildCaseContext(
    caseId: string,
    userId: string,
    userRole: UserRole,
  ) {
    const caseRecord = await this.checkCaseAccess(caseId, userId, userRole);

    const [parties, deadlines, documents] = await Promise.all([
      this.prisma.caseParty.findMany({
        where: {
          caseId,
        },
        orderBy: {
          createdAt: 'asc',
        },
      }),

      this.prisma.deadline.findMany({
        where: {
          caseId,
        },
        orderBy: {
          dueDate: 'asc',
        },
      }),

      this.prisma.caseDocument.findMany({
        where: {
          caseId,
        },
        orderBy: {
          createdAt: 'asc',
        },
        take: 5,
      }),
    ]);

    const partyText = parties
      .map(
        (party) =>
          `- ${party.name} | Type: ${party.partyType} | Role: ${
            party.roleInCase
          }${party.notes ? ` | Notes: ${party.notes}` : ''}`,
      )
      .join('\n');

    const deadlineText = deadlines
      .map(
        (deadline) =>
          `- ${deadline.title} | Type: ${
            deadline.deadlineType
          } | Due: ${deadline.dueDate.toISOString()} | Status: ${
            deadline.status
          }`,
      )
      .join('\n');

    const documentText = documents
      .map(
        (document) =>
          `Document: ${document.title}
Type: ${document.documentType}
Status: ${document.processingStatus}
Extracted Text:
${
  document.extractedText
    ? document.extractedText.slice(0, 6000)
    : 'No extracted text available.'
}`,
      )
      .join('\n\n');

    return `
CASE:
Reference Number: ${caseRecord.referenceNumber}
Title: ${caseRecord.title}
Case Type: ${caseRecord.caseType}
Category: ${caseRecord.category ?? 'Not specified'}
Status: ${caseRecord.status}
Priority: ${caseRecord.priority}
Description: ${caseRecord.description ?? 'Not provided'}

PARTIES:
${partyText || 'No parties recorded.'}

DEADLINES:
${deadlineText || 'No deadlines recorded.'}

CASE DOCUMENTS:
${documentText || 'No case documents recorded.'}
    `.trim();
  }

  async sendMessage(
    conversationId: string,
    message: string,
    userId: string,
    userRole: UserRole,
  ) {
    const conversation = await this.findOne(conversationId, userId, userRole);

    const previousMessages = await this.prisma.aiMessage.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 8,
      select: {
        role: true,
        content: true,
      },
    });

    const history = previousMessages.reverse().map((item) => ({
      role: item.role as 'USER' | 'ASSISTANT',
      content: item.content,
    }));

    const userMessage = await this.prisma.aiMessage.create({
      data: {
        conversationId,
        role: 'USER',
        content: message.trim(),
      },
    });

    let caseContext = '';

    if (conversation.caseId) {
      caseContext = await this.buildCaseContext(
        conversation.caseId,
        userId,
        userRole,
      );
    }

    const result = await this.aiService.ask(
      message.trim(),
      history,
      caseContext,
    );

    return this.prisma.$transaction(async (tx) => {
      const assistantMessage = await tx.aiMessage.create({
        data: {
          conversationId,
          role: 'ASSISTANT',
          content: result.answer,
        },
      });

      if (result.sources.length > 0) {
        await tx.aiCitation.createMany({
          data: result.sources.map((source) => ({
            messageId: assistantMessage.id,
            legalChunkId: source.chunkId,
          })),
          skipDuplicates: true,
        });
      }

      const isDefaultTitle =
        conversation.title === 'Case AI Conversation' ||
        conversation.title === 'General AI Conversation';

      await tx.aiConversation.update({
        where: {
          id: conversationId,
        },
        data: {
          updatedAt: new Date(),

          ...(isDefaultTitle && history.length === 0
            ? {
                title: this.createAutomaticTitle(message),
              }
            : {}),
        },
      });

      return {
        userMessage,
        assistantMessage,
        sources: result.sources,
      };
    });
  }
}
