import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import type { FastifyRequest } from 'fastify';
import { UserRepository } from '../../domain/repositories/user.repository';
import { SessionRepository } from '../../domain/repositories/session.repository';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthenticatedRequestUser } from '../decorators/current-user.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly users: UserRepository,
    private readonly sessions: SessionRepository,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const req = context.switchToHttp().getRequest<FastifyRequest>();
    const cookieName = this.config.getOrThrow<string>('auth.cookieName');
    const sessionId = req.cookies?.[cookieName];

    if (!sessionId) {
      if (isPublic) return true;
      throw new UnauthorizedException('not_authenticated');
    }

    const session = await this.sessions.findById(sessionId);
    if (!session) {
      if (isPublic) return true;
      throw new UnauthorizedException('invalid_session');
    }

    if (session.expiresAt.getTime() < Date.now()) {
      await this.sessions.delete(session.id);
      if (isPublic) return true;
      throw new UnauthorizedException('session_expired');
    }

    const user = await this.users.findById(session.userId);
    if (!user) {
      if (isPublic) return true;
      throw new UnauthorizedException('user_not_found');
    }

    const ttl = this.config.getOrThrow<number>('auth.sessionTtlSec');
    await this.sessions.touch(session.id, ttl);

    (req as FastifyRequest & { auth?: AuthenticatedRequestUser }).auth = {
      user,
      sessionId: session.id,
    };
    return true;
  }
}
