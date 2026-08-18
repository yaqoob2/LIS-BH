import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { UserRole } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCasePartyDto } from './dto/create-case-party.dto';
import { UpdateCasePartyDto } from './dto/update-case-party.dto';

@Injectable()
export class CasePartiesService {
  constructor(private readonly prisma: PrismaService) {}

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

  async create(dto: CreateCasePartyDto, userId: string, userRole: UserRole) {
    await this.checkCaseAccess(dto.caseId, userId, userRole);

    return this.prisma.$transaction(async (tx) => {
      const party = await tx.caseParty.create({
        data: {
          caseId: dto.caseId,
          name: dto.name.trim(),
          partyType: dto.partyType,
          roleInCase: dto.roleInCase.trim(),
          notes: dto.notes?.trim() || null,
          createdById: userId,
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'CASE_PARTY_CREATED',
          entityType: 'CASE_PARTY',
          entityId: party.id,
        },
      });

      return party;
    });
  }

  async findByCase(caseId: string, userId: string, userRole: UserRole) {
    await this.checkCaseAccess(caseId, userId, userRole);

    return this.prisma.caseParty.findMany({
      where: { caseId },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async update(
    id: string,
    dto: UpdateCasePartyDto,
    userId: string,
    userRole: UserRole,
  ) {
    const existing = await this.prisma.caseParty.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Case party not found');
    }

    await this.checkCaseAccess(existing.caseId, userId, userRole);

    return this.prisma.$transaction(async (tx) => {
      const party = await tx.caseParty.update({
        where: { id },
        data: {
          name: dto.name?.trim(),
          partyType: dto.partyType,
          roleInCase: dto.roleInCase?.trim(),

          notes: dto.notes !== undefined ? dto.notes.trim() || null : undefined,

          updatedById: userId,
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'CASE_PARTY_UPDATED',
          entityType: 'CASE_PARTY',
          entityId: party.id,
        },
      });

      return party;
    });
  }
  async remove(id: string, userId: string, userRole: UserRole) {
    const existing = await this.prisma.caseParty.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Case party not found');
    }

    await this.checkCaseAccess(existing.caseId, userId, userRole);

    await this.prisma.$transaction(async (tx) => {
      await tx.auditLog.create({
        data: {
          userId,
          action: 'CASE_PARTY_DELETED',
          entityType: 'CASE_PARTY',
          entityId: id,
        },
      });

      await tx.caseParty.delete({
        where: { id },
      });
    });

    return {
      message: 'Case party deleted successfully',
    };
  }
}
