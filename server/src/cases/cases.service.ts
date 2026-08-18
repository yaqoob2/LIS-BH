import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '../generated/prisma/client';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';

@Injectable()
export class CasesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCaseDto, userId: string, userRole: UserRole) {
    const referenceNumber = dto.referenceNumber.trim();

    const existing = await this.prisma.case.findUnique({
      where: {
        referenceNumber,
      },
    });

    if (existing) {
      throw new ConflictException('Case reference number already exists');
    }

    // Normal users cannot assign a case to somebody else.
    if (
      dto.assignedUserId &&
      userRole !== UserRole.ADMIN &&
      dto.assignedUserId !== userId
    ) {
      throw new ForbiddenException('Users can only assign cases to themselves');
    }

    // If someone is being assigned, make sure they exist and are active.
    if (dto.assignedUserId) {
      const assignedUser = await this.prisma.user.findUnique({
        where: {
          id: dto.assignedUserId,
        },
        select: {
          id: true,
          isActive: true,
        },
      });

      if (!assignedUser || !assignedUser.isActive) {
        throw new BadRequestException('Assigned user is invalid or inactive');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const newCase = await tx.case.create({
        data: {
          referenceNumber,
          title: dto.title.trim(),
          caseType: dto.caseType.trim(),
          category: dto.category?.trim() || null,
          status: dto.status,
          priority: dto.priority,
          description: dto.description?.trim() || null,
          assignedUserId: dto.assignedUserId || null,
          createdById: userId,
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'CASE_CREATED',
          entityType: 'CASE',
          entityId: newCase.id,
        },
      });

      return newCase;
    });
  }
  async findAll(userId: string, userRole: UserRole) {
    return this.prisma.case.findMany({
      where:
        userRole === UserRole.ADMIN
          ? {}
          : {
              OR: [{ createdById: userId }, { assignedUserId: userId }],
            },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }
  async findOne(id: string, userId: string, userRole: UserRole) {
    const caseRecord = await this.prisma.case.findFirst({
      where: {
        id,
        ...(userRole === UserRole.ADMIN
          ? {}
          : {
              OR: [{ createdById: userId }, { assignedUserId: userId }],
            }),
      },
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!caseRecord) {
      throw new NotFoundException('Case not found');
    }

    return caseRecord;
  }
  async update(
    id: string,
    dto: UpdateCaseDto,
    userId: string,
    userRole: UserRole,
  ) {
    await this.findOne(id, userId, userRole);

    if (
      dto.assignedUserId &&
      userRole !== UserRole.ADMIN &&
      dto.assignedUserId !== userId
    ) {
      throw new ForbiddenException('Users can only assign cases to themselves');
    }

    if (dto.assignedUserId) {
      const assignedUser = await this.prisma.user.findUnique({
        where: { id: dto.assignedUserId },
        select: {
          id: true,
          isActive: true,
        },
      });

      if (!assignedUser || !assignedUser.isActive) {
        throw new BadRequestException('Assigned user is invalid or inactive');
      }
    }

    if (dto.referenceNumber) {
      const duplicate = await this.prisma.case.findFirst({
        where: {
          referenceNumber: dto.referenceNumber.trim(),
          NOT: {
            id,
          },
        },
      });

      if (duplicate) {
        throw new ConflictException('Case reference number already exists');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedCase = await tx.case.update({
        where: { id },
        data: {
          referenceNumber: dto.referenceNumber?.trim(),
          title: dto.title?.trim(),
          caseType: dto.caseType?.trim(),

          category:
            dto.category !== undefined
              ? dto.category.trim() || null
              : undefined,

          status: dto.status,
          priority: dto.priority,

          description:
            dto.description !== undefined
              ? dto.description.trim() || null
              : undefined,

          assignedUserId: dto.assignedUserId,
          updatedById: userId,
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'CASE_UPDATED',
          entityType: 'CASE',
          entityId: updatedCase.id,
        },
      });

      return updatedCase;
    });
  }
  async claim(id: string, userId: string) {
    const caseRecord = await this.prisma.case.findUnique({
      where: { id },
    });

    if (!caseRecord) {
      throw new NotFoundException('Case not found');
    }

    if (caseRecord.assignedUserId) {
      throw new ConflictException('Case is already assigned');
    }

    return this.prisma.$transaction(async (tx) => {
      const result = await tx.case.updateMany({
        where: {
          id,
          assignedUserId: null,
        },
        data: {
          assignedUserId: userId,
          updatedById: userId,
        },
      });

      if (result.count === 0) {
        throw new ConflictException('Case is already assigned');
      }

      await tx.auditLog.create({
        data: {
          userId,
          action: 'CASE_CLAIMED',
          entityType: 'CASE',
          entityId: id,
        },
      });

      return tx.case.findUnique({
        where: { id },
      });
    });
  }
  async assign(
    id: string,
    assignedUserId: string | null | undefined,
    adminUserId: string,
  ) {
    const caseRecord = await this.prisma.case.findUnique({
      where: { id },
    });

    if (!caseRecord) {
      throw new NotFoundException('Case not found');
    }

    if (assignedUserId) {
      const user = await this.prisma.user.findUnique({
        where: { id: assignedUserId },
        select: {
          id: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        throw new BadRequestException('Assigned user is invalid or inactive');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedCase = await tx.case.update({
        where: { id },
        data: {
          assignedUserId: assignedUserId ?? null,
          updatedById: adminUserId,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: assignedUserId ? 'CASE_ASSIGNED' : 'CASE_UNASSIGNED',
          entityType: 'CASE',
          entityId: id,
        },
      });

      return updatedCase;
    });
  }
}
