import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Session } from '../domain/session.entity';
import { User } from '../domain/user.entity';
import { UserRepository } from '../domain/repositories/user.repository';
import { SessionRepository } from '../domain/repositories/session.repository';
import { PasswordHasher } from '../domain/services/password-hasher';

export interface LoginInput {
  phone: string;
  password: string;
  sessionTtlSec: number;
}

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly sessions: SessionRepository,
    private readonly hasher: PasswordHasher,
  ) {}

  async execute(input: LoginInput): Promise<{ user: User; session: Session }> {
    const user = await this.users.findByPhone(input.phone);
    if (!user) throw new UnauthorizedException('user_not_found');

    const ok = await this.hasher.verify(user.passwordHash, input.password);
    if (!ok) throw new UnauthorizedException('password_incorrect');

    const session = await this.sessions.create(user.id, input.sessionTtlSec);
    return { user, session };
  }
}
