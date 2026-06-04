import { Session } from '../session.entity';

export abstract class SessionRepository {
  abstract create(userId: string, ttlSec: number): Promise<Session>;
  abstract findById(id: string): Promise<Session | null>;
  abstract touch(id: string, ttlSec: number): Promise<void>;
  abstract delete(id: string): Promise<void>;
  abstract deleteAllForUser(userId: string): Promise<void>;
}
