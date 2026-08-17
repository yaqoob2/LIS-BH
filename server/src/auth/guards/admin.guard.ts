import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from '../types/jwt-payload.type';

type AuthenticatedRequest = Request & {
  user?: JwtPayload;
};

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request =
      context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.user) {
      throw new ForbiddenException('User authentication information is missing');
    }

    if (request.user.role !== 'ADMIN') {
      throw new ForbiddenException('Administrator access required');
    }

    return true;
  }
}