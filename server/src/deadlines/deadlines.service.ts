import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { UserRole } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeadlineDto } from './dto/create-deadline.dto';
import { UpdateDeadlineDto } from './dto/update-deadline.dto';

@Injectable()
export class DeadlinesService {
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
  }

  async create(dto: CreateDeadlineDto, userId: string, userRole: UserRole) {
    await this.checkCaseAccess(dto.caseId, userId, userRole);

    return this.prisma.$transaction(async (tx) => {
      const deadline = await tx.deadline.create({
        data: {
          caseId: dto.caseId,
          title: dto.title.trim(),
          deadlineType: dto.deadlineType.trim(),
          dueDate: new Date(dto.dueDate),
          status: dto.status,
          createdById: userId,
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'DEADLINE_CREATED',
          entityType: 'DEADLINE',
          entityId: deadline.id,
        },
      });

      return deadline;
    });
  }

  async findByCase(caseId: string, userId: string, userRole: UserRole) {
    await this.checkCaseAccess(caseId, userId, userRole);

    return this.prisma.deadline.findMany({
      where: { caseId },
      orderBy: {
        dueDate: 'asc',
      },
    });
  }

  async update(
    id: string,
    dto: UpdateDeadlineDto,
    userId: string,
    userRole: UserRole,
  ) {
    const existing = await this.prisma.deadline.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Deadline not found');
    }

    await this.checkCaseAccess(existing.caseId, userId, userRole);

    return this.prisma.$transaction(async (tx) => {
      const deadline = await tx.deadline.update({
        where: { id },
        data: {
          title: dto.title?.trim(),
          deadlineType: dto.deadlineType?.trim(),
          dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
          status: dto.status,
          updatedById: userId,
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'DEADLINE_UPDATED',
          entityType: 'DEADLINE',
          entityId: id,
        },
      });

      return deadline;
    });
  }

  async remove(id: string, userId: string, userRole: UserRole) {
    const existing = await this.prisma.deadline.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Deadline not found');
    }

    await this.checkCaseAccess(existing.caseId, userId, userRole);

    await this.prisma.$transaction(async (tx) => {
      await tx.auditLog.create({
        data: {
          userId,
          action: 'DEADLINE_DELETED',
          entityType: 'DEADLINE',
          entityId: id,
        },
      });

      await tx.deadline.delete({
        where: { id },
      });
    });

    return {
      message: 'Deadline deleted successfully',
    };
  }
}
