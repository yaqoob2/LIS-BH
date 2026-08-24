import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

import { PrismaService } from '../../prisma/prisma.service';
import type { ClientPortalJwtPayload } from '../types/client-portal-jwt-payload.type';

type PortalRequest = Request & {
  portalClient?: ClientPortalJwtPayload;
};

@Injectable()
export class ClientPortalGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<PortalRequest>();

    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException('Client portal authentication required');
    }

    const [type, token] = authorization.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid client portal token');
    }

    try {
      const payload = await this.jwtService.verifyAsync<ClientPortalJwtPayload>(
        token,
        {
          secret: this.configService.getOrThrow<string>(
            'CLIENT_PORTAL_JWT_SECRET',
          ),
        },
      );

      if (payload.tokenType !== 'CLIENT_PORTAL') {
        throw new UnauthorizedException('Invalid client portal token');
      }

      const client = await this.prisma.client.findUnique({
        where: {
          id: payload.sub,
        },
        select: {
          id: true,
          isActive: true,
        },
      });

      if (!client || !client.isActive) {
        throw new UnauthorizedException('Client portal access unavailable');
      }

      request.portalClient = {
        sub: client.id,
        tokenType: 'CLIENT_PORTAL',
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Invalid or expired client portal token');
    }
  }
}
