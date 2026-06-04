import { Injectable } from '@nestjs/common';
import { SessionRepository } from '../domain/repositories/session.repository';

@Injectable()
export class LogoutUseCase {
  constructor(private readonly sessions: SessionRepository) {}

  async execute(sessionId: string): Promise<void> {
    await this.sessions.delete(sessionId);
  }
}
