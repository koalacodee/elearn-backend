import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { User } from '../../domain/user.entity';

export interface AuthenticatedRequestUser {
  user: User;
  sessionId: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User | undefined => {
    const req = ctx
      .switchToHttp()
      .getRequest<{ auth?: AuthenticatedRequestUser }>();
    return req.auth?.user;
  },
);

export const CurrentSessionId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const req = ctx
      .switchToHttp()
      .getRequest<{ auth?: AuthenticatedRequestUser }>();
    return req.auth?.sessionId;
  },
);
