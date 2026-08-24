import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type { Client } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ClientIdentityService } from './client-identity.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clientIdentityService: ClientIdentityService,
  ) {}

  private toSafeClient<T extends Client>(client: T) {
    const { identityNumberEncrypted, identityNumberHash, ...safeClient } =
      client;

    const identityNumber = this.clientIdentityService.decrypt(
      identityNumberEncrypted,
    );

    return {
      ...safeClient,
      identityNumberMasked: this.clientIdentityService.mask(identityNumber),
    };
  }

  async createOrReuse(dto: CreateClientDto, userId: string) {
    const identityHash = this.clientIdentityService.createLookupHash(
      dto.identityType,
      dto.identityNumber,
    );

    const existingClient = await this.prisma.client.findUnique({
      where: {
        identityNumberHash: identityHash,
      },
    });

    if (existingClient) {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action: 'CLIENT_REUSED',
          entityType: 'CLIENT',
          entityId: existingClient.id,
        },
      });

      return {
        reused: true,
        client: this.toSafeClient(existingClient),
      };
    }

    const encryptedIdentity = this.clientIdentityService.encrypt(
      dto.identityNumber,
    );

    const client = await this.prisma.$transaction(async (tx) => {
      const createdClient = await tx.client.create({
        data: {
          name: dto.name.trim(),
          whatsappNumber: dto.whatsappNumber.trim(),
          identityType: dto.identityType,
          identityNumberEncrypted: encryptedIdentity,
          identityNumberHash: identityHash,
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'CLIENT_CREATED',
          entityType: 'CLIENT',
          entityId: createdClient.id,
        },
      });

      return createdClient;
    });

    return {
      reused: false,
      client: this.toSafeClient(client),
    };
  }

  async findAll() {
    const clients = await this.prisma.client.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return clients.map((client) => this.toSafeClient(client));
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: {
        id,
      },
      include: {
        cases: {
          select: {
            id: true,
            referenceNumber: true,
            title: true,
            caseType: true,
            status: true,
            priority: true,
            totalFee: true,
            currency: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return this.toSafeClient(client);
  }

  async update(id: string, dto: UpdateClientDto, userId: string) {
    const existingClient = await this.prisma.client.findUnique({
      where: {
        id,
      },
    });

    if (!existingClient) {
      throw new NotFoundException('Client not found');
    }

    const identityType = dto.identityType ?? existingClient.identityType;

    const currentIdentityNumber = this.clientIdentityService.decrypt(
      existingClient.identityNumberEncrypted,
    );

    const identityNumber = dto.identityNumber ?? currentIdentityNumber;

    let identityNumberHash = existingClient.identityNumberHash;

    let identityNumberEncrypted = existingClient.identityNumberEncrypted;

    if (dto.identityType !== undefined || dto.identityNumber !== undefined) {
      identityNumberHash = this.clientIdentityService.createLookupHash(
        identityType,
        identityNumber,
      );

      const duplicate = await this.prisma.client.findUnique({
        where: {
          identityNumberHash,
        },
      });

      if (duplicate && duplicate.id !== existingClient.id) {
        throw new ConflictException(
          'Another client already uses this CPR or passport number',
        );
      }

      if (dto.identityNumber !== undefined) {
        identityNumberEncrypted =
          this.clientIdentityService.encrypt(identityNumber);
      }
    }

    const updatedClient = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.client.update({
        where: {
          id,
        },
        data: {
          ...(dto.name !== undefined && {
            name: dto.name.trim(),
          }),

          ...(dto.whatsappNumber !== undefined && {
            whatsappNumber: dto.whatsappNumber.trim(),
          }),

          ...(dto.identityType !== undefined && {
            identityType: dto.identityType,
          }),

          ...(dto.identityType !== undefined || dto.identityNumber !== undefined
            ? {
                identityNumberHash,
                identityNumberEncrypted,
              }
            : {}),

          ...(dto.isActive !== undefined && {
            isActive: dto.isActive,
          }),
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action:
            dto.isActive === false
              ? 'CLIENT_DEACTIVATED'
              : dto.isActive === true && existingClient.isActive === false
                ? 'CLIENT_REACTIVATED'
                : 'CLIENT_UPDATED',

          entityType: 'CLIENT',
          entityId: id,
        },
      });

      return updated;
    });

    return this.toSafeClient(updatedClient);
  }
}
