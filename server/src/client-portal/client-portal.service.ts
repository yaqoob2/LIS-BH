import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'crypto';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientPortalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  async createMagicLink(clientId: string, staffUserId: string) {
    const client = await this.prisma.client.findUnique({
      where: {
        id: clientId,
      },
      select: {
        id: true,
        name: true,
        whatsappNumber: true,
        isActive: true,
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    if (!client.isActive) {
      throw new BadRequestException('Client is inactive');
    }

    const token = randomBytes(32).toString('base64url');

    const tokenHash = this.hashToken(token);

    const minutes = Number(
      this.configService.get<string>(
        'CLIENT_PORTAL_MAGIC_LINK_EXPIRES_MINUTES',
        '30',
      ),
    );

    const expiresAt = new Date(Date.now() + minutes * 60 * 1000);

    await this.prisma.$transaction(async (tx) => {
      await tx.clientPortalToken.deleteMany({
        where: {
          clientId,
          usedAt: null,
        },
      });

      await tx.clientPortalToken.create({
        data: {
          clientId,
          tokenHash,
          expiresAt,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: staffUserId,
          action: 'CLIENT_PORTAL_LINK_CREATED',
          entityType: 'CLIENT',
          entityId: clientId,
        },
      });
    });

    return {
      client: {
        id: client.id,
        name: client.name,
        whatsappNumber: client.whatsappNumber,
      },
      token,
      expiresAt,
    };
  }

  async access(rawToken: string) {
    const token = rawToken.trim();

    if (!token) {
      throw new UnauthorizedException('Invalid portal link');
    }

    const tokenHash = this.hashToken(token);

    const record = await this.prisma.clientPortalToken.findUnique({
      where: {
        tokenHash,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
      },
    });

    if (!record) {
      throw new UnauthorizedException('Invalid portal link');
    }

    if (record.usedAt) {
      throw new UnauthorizedException('Portal link has already been used');
    }

    if (record.expiresAt <= new Date()) {
      throw new UnauthorizedException('Portal link has expired');
    }

    if (!record.client.isActive) {
      throw new UnauthorizedException('Client portal unavailable');
    }

    const consumed = await this.prisma.clientPortalToken.updateMany({
      where: {
        id: record.id,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      data: {
        usedAt: new Date(),
      },
    });

    if (consumed.count !== 1) {
      throw new UnauthorizedException('Portal link is no longer valid');
    }

    const accessToken = await this.jwtService.signAsync(
      {
        sub: record.client.id,
        tokenType: 'CLIENT_PORTAL',
      },
      {
        secret: this.configService.getOrThrow<string>(
          'CLIENT_PORTAL_JWT_SECRET',
        ),
        expiresIn: Number(
          this.configService.getOrThrow<string>('CLIENT_PORTAL_JWT_EXPIRES_IN'),
        ),
      },
    );

    return {
      accessToken,
      client: {
        id: record.client.id,
        name: record.client.name,
      },
    };
  }

  async getPortal(clientId: string) {
    const client = await this.prisma.client.findUnique({
      where: {
        id: clientId,
      },
      select: {
        id: true,
        name: true,
        isActive: true,

        cases: {
          orderBy: {
            createdAt: 'desc',
          },

          select: {
            id: true,
            referenceNumber: true,
            title: true,
            caseType: true,
            status: true,
            totalFee: true,
            currency: true,

            feeMilestones: {
              orderBy: {
                sequence: 'asc',
              },

              select: {
                id: true,
                title: true,
                description: true,
                amount: true,
                sequence: true,
                status: true,
                completedAt: true,
              },
            },
          },
        },
      },
    });

    if (!client || !client.isActive) {
      throw new NotFoundException('Client portal not found');
    }

    return {
      client: {
        id: client.id,
        name: client.name,
      },

      cases: client.cases.map((item) => {
        const completed = item.feeMilestones.filter(
          (milestone) => milestone.status === 'COMPLETED',
        ).length;

        const progressPercentage =
          item.feeMilestones.length === 0
            ? 0
            : Math.round((completed / item.feeMilestones.length) * 100);

        return {
          id: item.id,
          referenceNumber: item.referenceNumber,
          title: item.title,
          caseType: item.caseType,
          status: item.status,
          totalFee: item.totalFee,
          currency: item.currency,
          progressPercentage,
          milestones: item.feeMilestones,
        };
      }),
    };
  }
}
