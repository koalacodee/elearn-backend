import { ConflictException, Injectable } from '@nestjs/common';
import { Session } from '../domain/session.entity';
import { User } from '../domain/user.entity';
import { UserRole } from '../domain/user-role.enum';
import { UserRepository } from '../domain/repositories/user.repository';
import { SessionRepository } from '../domain/repositories/session.repository';
import { PasswordHasher } from '../domain/services/password-hasher';

export interface RegisterInput {
  phone: string;
  password: string;
  name: string;
  sessionTtlSec: number;
}

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly sessions: SessionRepository,
    private readonly hasher: PasswordHasher,
  ) {}

  async execute(
    input: RegisterInput,
  ): Promise<{ user: User; session: Session }> {
    const existing = await this.users.findByPhone(input.phone);
    if (existing) throw new ConflictException('phone_already_registered');

    const passwordHash = await this.hasher.hash(input.password);
    const user = await this.users.create({
      phone: input.phone,
      passwordHash,
      name: input.name,
      role: UserRole.STUDENT,
    });
    const session = await this.sessions.create(user.id, input.sessionTtlSec);
    return { user, session };
  }
}
