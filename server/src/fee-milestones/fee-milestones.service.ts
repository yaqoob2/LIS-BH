import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

import { CasesService } from '../cases/cases.service';
import { FeeMilestoneStatus, UserRole } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SaveFeeMilestonesDto } from './dto/save-fee-milestones.dto';
import { ClientPortalService } from '../client-portal/client-portal.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';

type AiMilestone = {
  title: string;
  description: string;
  amount: string;
};

@Injectable()
export class FeeMilestonesService {
  private readonly openai: OpenAI;

  constructor(
    private readonly configService: ConfigService,
    private readonly casesService: CasesService,
    private readonly prisma: PrismaService,
    private readonly clientPortalService: ClientPortalService,
    private readonly whatsappService: WhatsAppService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.getOrThrow<string>('OPENAI_API_KEY'),
    });
  }

  private toMinorUnits(value: string): bigint {
    const clean = value.trim();

    if (!/^\d+(\.\d{1,3})?$/.test(clean)) {
      throw new BadRequestException('Invalid milestone amount');
    }

    const [whole, decimal = ''] = clean.split('.');

    return BigInt(`${whole}${decimal.padEnd(3, '0')}`);
  }

  private fromMinorUnits(value: bigint): string {
    const raw = value.toString().padStart(4, '0');

    return `${raw.slice(0, -3)}.${raw.slice(-3)}`;
  }

  private parseAiResponse(text: string): AiMilestone[] {
    const cleaned = text
      .trim()
      .replace(/^```json/i, '')
      .replace(/^```/i, '')
      .replace(/```$/i, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    if (!parsed || !Array.isArray(parsed.milestones)) {
      throw new Error('Invalid AI milestone response');
    }

    return parsed.milestones;
  }

  private validateMilestones(milestones: AiMilestone[], totalFee: string) {
    if (milestones.length < 4 || milestones.length > 6) {
      throw new Error('AI must generate 4 to 6 milestones');
    }

    const normalized = milestones.map((milestone, index) => {
      if (
        !milestone.title?.trim() ||
        !milestone.description?.trim() ||
        !milestone.amount
      ) {
        throw new Error('Invalid milestone');
      }

      const amountMinor = this.toMinorUnits(String(milestone.amount));

      if (amountMinor <= 0n) {
        throw new Error('Milestone amount must be positive');
      }

      return {
        sequence: index + 1,
        title: milestone.title.trim(),
        description: milestone.description.trim(),
        amount: this.fromMinorUnits(amountMinor),
      };
    });

    const expectedTotal = this.toMinorUnits(totalFee);

    const actualTotal = normalized.reduce(
      (sum, milestone) => sum + this.toMinorUnits(milestone.amount),
      0n,
    );

    if (actualTotal !== expectedTotal) {
      throw new Error('Milestone total does not equal case total fee');
    }

    return normalized;
  }

  async suggest(caseId: string, userId: string, userRole: UserRole) {
    const caseRecord = await this.casesService.findOne(
      caseId,
      userId,
      userRole,
    );

    if (!caseRecord.totalFee) {
      throw new BadRequestException(
        'Case must have a total fee before generating milestones',
      );
    }

    const totalFee = caseRecord.totalFee.toString();

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await this.openai.responses.create({
          model: 'gpt-5.6-terra',

          reasoning: {
            effort: 'low',
          },

          input: `
You are assisting a law firm in creating a CLIENT-FACING professional fee milestone breakdown.

This is NOT legal advice.
Do NOT determine the total professional fee.
The lawyer has already agreed the total fee.

CASE INFORMATION

Case type:
${caseRecord.caseType}

Category:
${caseRecord.category ?? 'Not specified'}

Case description:
${caseRecord.description ?? 'Not specified'}

TOTAL AGREED PROFESSIONAL FEE:
${totalFee} ${caseRecord.currency}

YOUR TASK

Break the total professional fee into 4 to 6 sensible legal-service milestones.

IMPORTANT RULES

1. The milestone amounts MUST add up EXACTLY to ${totalFee} ${caseRecord.currency}.
2. Use no more than 3 decimal places.
3. Every amount must be greater than zero.
4. Use clear professional client-friendly wording.
5. Do not invent dates, hearings, outcomes, deadlines, or facts.
6. Do not provide legal conclusions.
7. Generate between 4 and 6 milestones.
8. Do not include the client name.
9. Return JSON only.
10. Do not wrap the JSON in markdown.

Return exactly:

{
  "milestones": [
    {
      "title": "Initial Case Review",
      "description": "Review of the case information and available documents.",
      "amount": "150.000"
    }
  ]
}
            `,
        });

        const milestones = this.parseAiResponse(response.output_text);

        const validated = this.validateMilestones(milestones, totalFee);

        return {
          caseId: caseRecord.id,
          referenceNumber: caseRecord.referenceNumber,
          totalFee,
          currency: caseRecord.currency,
          milestones: validated,
        };
      } catch {
        if (attempt === 2) {
          throw new BadRequestException(
            'AI could not generate a valid milestone breakdown. Please try again.',
          );
        }
      }
    }

    throw new BadRequestException('Unable to generate milestones');
  }

  async saveApproved(
    caseId: string,
    dto: SaveFeeMilestonesDto,
    userId: string,
    userRole: UserRole,
  ) {
    const caseRecord = await this.casesService.findOne(
      caseId,
      userId,
      userRole,
    );

    if (!caseRecord.totalFee) {
      throw new BadRequestException('Case does not have a total fee');
    }

    const existing = await this.prisma.feeMilestone.count({
      where: {
        caseId,
      },
    });

    if (existing > 0) {
      throw new ConflictException(
        'Fee milestones have already been approved for this case',
      );
    }

    const totalFee = this.toMinorUnits(caseRecord.totalFee.toString());

    const milestoneTotal = dto.milestones.reduce((sum, milestone) => {
      const amount = this.toMinorUnits(milestone.amount);

      if (amount <= 0n) {
        throw new BadRequestException(
          'Milestone amounts must be greater than zero',
        );
      }

      return sum + amount;
    }, 0n);

    if (milestoneTotal !== totalFee) {
      throw new BadRequestException(
        `Milestone amounts must total exactly ${caseRecord.totalFee.toString()} ${caseRecord.currency}`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      for (let index = 0; index < dto.milestones.length; index++) {
        const milestone = dto.milestones[index];

        await tx.feeMilestone.create({
          data: {
            caseId,

            title: milestone.title.trim(),

            description: milestone.description?.trim() || null,

            amount: milestone.amount,

            sequence: index + 1,

            createdById: userId,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          userId,
          action: 'FEE_MILESTONES_APPROVED',
          entityType: 'CASE',
          entityId: caseId,
        },
      });
    });

    return this.findByCase(caseId, userId, userRole);
  }

  async findByCase(caseId: string, userId: string, userRole: UserRole) {
    await this.casesService.findOne(caseId, userId, userRole);

    return this.prisma.feeMilestone.findMany({
      where: {
        caseId,
      },

      orderBy: {
        sequence: 'asc',
      },
    });
  }
  async updateStatus(
    milestoneId: string,
    status: FeeMilestoneStatus,
    userId: string,
    userRole: UserRole,
  ) {
    const milestone = await this.prisma.feeMilestone.findUnique({
      where: {
        id: milestoneId,
      },
    });

    if (!milestone) {
      throw new BadRequestException('Fee milestone not found');
    }

    await this.casesService.findOne(milestone.caseId, userId, userRole);

    if (milestone.status === status) {
      return milestone;
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedMilestone = await tx.feeMilestone.update({
        where: {
          id: milestoneId,
        },

        data: {
          status,

          completedAt:
            status === FeeMilestoneStatus.COMPLETED ? new Date() : null,

          updatedById: userId,
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'FEE_MILESTONE_STATUS_UPDATED',
          entityType: 'FEE_MILESTONE',
          entityId: milestoneId,
        },
      });

      return updatedMilestone;
    });

    if (
      status === FeeMilestoneStatus.IN_PROGRESS ||
      status === FeeMilestoneStatus.COMPLETED
    ) {
      try {
        await this.sendClientNotification(milestoneId, userId);
      } catch (error) {
        console.error(
          'Milestone updated but WhatsApp notification failed:',
          error,
        );
      }
    }

    return updated;
  }
  private async sendClientNotification(
    milestoneId: string,
    staffUserId: string,
  ) {
    const milestone = await this.prisma.feeMilestone.findUnique({
      where: {
        id: milestoneId,
      },

      select: {
        title: true,
        status: true,

        case: {
          select: {
            referenceNumber: true,

            client: {
              select: {
                id: true,
                whatsappNumber: true,
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (
      !milestone ||
      !milestone.case.client ||
      !milestone.case.client.isActive
    ) {
      return;
    }

    const client = milestone.case.client;

    const magicLink = await this.clientPortalService.createMagicLink(
      client.id,
      staffUserId,
    );

    const portalBaseUrl = this.configService
      .getOrThrow<string>('CLIENT_PORTAL_URL')
      .replace(/\/+$/, '');

    const portalUrl = `${portalBaseUrl}?token=${encodeURIComponent(
      magicLink.token,
    )}`;

    const statusText =
      milestone.status === FeeMilestoneStatus.COMPLETED
        ? 'completed'
        : 'in progress';

    const message =
      `Case ${milestone.case.referenceNumber}: ` +
      `${milestone.title} is now ${statusText}. ` +
      `View your case progress: ${portalUrl}`;

    await this.whatsappService.sendMessage(client.whatsappNumber, message);
  }
}
