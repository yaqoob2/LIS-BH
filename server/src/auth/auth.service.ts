import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './types/jwt-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordIsValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!passwordIsValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entityType: 'USER',
        entityId: user.id,
      },
    });

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async forgotPassword(emailInput: string) {
    const email = emailInput.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    // Always return the same message.
    // This prevents attackers from discovering which emails exist.
    if (!user || !user.isActive) {
      return {
        message:
          'If an active account exists for this email, a password reset link will be sent.',
      };
    }

    const rawToken = randomBytes(32).toString('hex');

    const tokenHash = createHash('sha256').update(rawToken).digest('hex');

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:5173',
    );

    const resetLink = `${frontendUrl}/reset-password?token=${rawToken}`;

    // TEMPORARY LOCAL DEVELOPMENT ONLY.
    // Later this link will be emailed through our mail service.
    if (this.configService.get<string>('NODE_ENV') !== 'production') {
      console.log('Password reset link:', resetLink);
    }

    return {
      message:
        'If an active account exists for this email, a password reset link will be sent.',
    };
  }

  async resetPassword(rawToken: string, newPassword: string) {
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');

    const resetToken = await this.prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!resetToken || !resetToken.user.isActive) {
      throw new BadRequestException('Reset token is invalid or expired');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    const now = new Date();

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: {
          id: resetToken.userId,
        },
        data: {
          passwordHash,
          tokenVersion: {
            increment: 1,
          },
        },
      }),

      this.prisma.passwordResetToken.updateMany({
        where: {
          userId: resetToken.userId,
          usedAt: null,
        },
        data: {
          usedAt: now,
        },
      }),

      this.prisma.auditLog.create({
        data: {
          userId: resetToken.userId,
          action: 'PASSWORD_RESET',
          entityType: 'USER',
          entityId: resetToken.userId,
        },
      }),
    ]);

    return {
      message: 'Password has been reset successfully',
    };
  }

  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
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

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User account is unavailable');
    }

    return user;
  }
}
