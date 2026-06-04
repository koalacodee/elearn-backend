import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { FastifyRequest } from 'fastify';
import { UserRole } from '../../domain/user-role.enum';
import { ROLES_KEY } from '../decorators/role.decorator';
import { AuthenticatedRequestUser } from '../decorators/current-user.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const req = context
      .switchToHttp()
      .getRequest<FastifyRequest & { auth?: AuthenticatedRequestUser }>();
    const role = req.auth?.user.role;

    if (!role || !required.includes(role)) {
      throw new ForbiddenException('insufficient_role');
    }
    return true;
  }
}
