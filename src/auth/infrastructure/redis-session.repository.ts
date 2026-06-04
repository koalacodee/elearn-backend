import { Injectable } from '@nestjs/common';
import { uuidv7 } from 'helpers/uuidv7';
import { RedisService } from '../../common/redis/redis.service';
import { Session } from '../domain/session.entity';
import { SessionRepository } from '../domain/repositories/session.repository';

const sessionKey = (id: string) => `session:${id}`;
const userSessionsKey = (userId: string) => `user_sessions:${userId}`;

@Injectable()
export class RedisSessionRepository extends SessionRepository {
  constructor(private readonly redis: RedisService) {
    super();
  }

  async create(userId: string, ttlSec: number): Promise<Session> {
    const id = uuidv7();
    const expiresAt = new Date(Date.now() + ttlSec * 1000);
    await this.redis.hSet(sessionKey(id), {
      userId,
      expiresAt: expiresAt.toISOString(),
    });
    await this.redis.expire(sessionKey(id), ttlSec);
    await this.redis.sAdd(userSessionsKey(userId), id);
    return { id, userId, expiresAt };
  }

  async findById(id: string): Promise<Session | null> {
    const data = await this.redis.hGetAll(sessionKey(id));
    if (!data || !data.userId || !data.expiresAt) return null;
    return {
      id,
      userId: data.userId,
      expiresAt: new Date(data.expiresAt),
    };
  }

  async touch(id: string, ttlSec: number): Promise<void> {
    const expiresAt = new Date(Date.now() + ttlSec * 1000);
    await this.redis.hSet(sessionKey(id), {
      expiresAt: expiresAt.toISOString(),
    });
    await this.redis.expire(sessionKey(id), ttlSec);
  }

  async delete(id: string): Promise<void> {
    const data = await this.redis.hGetAll(sessionKey(id));
    if (data?.userId) {
      await this.redis.sRem(userSessionsKey(data.userId), id);
    }
    await this.redis.del(sessionKey(id));
  }

  async deleteAllForUser(userId: string): Promise<void> {
    const ids = await this.redis.sMembers(userSessionsKey(userId));
    await Promise.all(ids.map((id) => this.redis.del(sessionKey(id))));
    await this.redis.del(userSessionsKey(userId));
  }
}
