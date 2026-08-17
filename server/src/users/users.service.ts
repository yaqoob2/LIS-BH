import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async create(dto: CreateUserDto, adminUserId: string) {
    const email = dto.email.trim().toLowerCase();

    const existingUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email,
        passwordHash,
        role: dto.role,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'USER_CREATED',
        entityType: 'USER',
        entityId: user.id,
      },
    });

    return user;
  }

  async update(userId: string, dto: UpdateUserDto, adminUserId: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    let email: string | undefined;

    if (dto.email) {
      email = dto.email.trim().toLowerCase();

      const emailOwner = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (emailOwner && emailOwner.id !== userId) {
        throw new ConflictException('A user with this email already exists');
      }
    }

    const passwordHash = dto.password
      ? await bcrypt.hash(dto.password, 12)
      : undefined;

    const updatedUser = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...(dto.name !== undefined && {
          name: dto.name.trim(),
        }),
        ...(email !== undefined && {
          email,
        }),
        ...(dto.role !== undefined && {
          role: dto.role,
        }),
        ...(dto.isActive !== undefined && {
          isActive: dto.isActive,
        }),
        ...(passwordHash !== undefined && {
          passwordHash,
        }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: dto.isActive === false ? 'USER_DEACTIVATED' : 'USER_UPDATED',
        entityType: 'USER',
        entityId: updatedUser.id,
      },
    });

    return updatedUser;
  }
}
