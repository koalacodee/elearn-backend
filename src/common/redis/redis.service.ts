import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisClient } from 'bun';
import { RedisClientType } from 'redis';

type RedisState =
  | { type: 'bun'; client: RedisClient }
  | { type: 'node'; client: RedisClientType };

@Injectable()
export class RedisService implements OnModuleDestroy, OnModuleInit {
  private state: RedisState | null;
  private isBun = typeof globalThis.Bun !== 'undefined';

  constructor(private readonly config: ConfigService) {
    this.state = null;
  }

  async hSet(key: string, data: Record<string, string>) {
    if (!this.state) return;
    if (this.state.type === 'bun') {
      await this.state.client.hset(key, data);
    } else {
      await this.state.client.hSet(key, data);
    }
  }

  async expire(key: string, ttl: number) {
    if (!this.state) return;
    if (this.state.type === 'bun') {
      await this.state.client.expire(key, ttl);
    } else {
      await this.state.client.expire(key, ttl);
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.state) return false;
    if (this.state.type === 'bun') {
      const result = await this.state.client.exists(key);
      return result;
    } else {
      const result = await this.state.client.exists(key);
      return result === 1;
    }
  }

  async hGetAll(key: string): Promise<Record<string, string> | null> {
    if (!this.state) return null;
    if (this.state.type === 'bun') {
      const exists = await this.state.client.exists(key);
      if (!exists) return null;
      return await this.state.client.hgetall(key);
    } else {
      const exists = await this.exists(key);
      if (!exists) return null;
      const data = await this.state.client.hGetAll(key);
      return data;
    }
  }

  async del(key: string) {
    if (!this.state) return;
    if (this.state.type === 'bun') {
      await this.state.client.del(key);
    } else {
      await this.state.client.del(key);
    }
  }

  async sAdd(key: string, member: string) {
    if (!this.state) return;
    if (this.state.type === 'bun') {
      await this.state.client.sadd(key, member);
    } else {
      await this.state.client.sAdd(key, member);
    }
  }

  async sMembers(key: string): Promise<string[]> {
    if (!this.state) return [];
    if (this.state.type === 'bun') {
      return await this.state.client.smembers(key);
    } else {
      return await this.state.client.sMembers(key);
    }
  }

  async sRem(key: string, member: string) {
    if (!this.state) return;
    if (this.state.type === 'bun') {
      await this.state.client.srem(key, member);
    } else {
      await this.state.client.sRem(key, member);
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.state) return null;
    if (this.state.type === 'bun') {
      const value = await this.state.client.get(key);
      return value ?? null;
    } else {
      return await this.state.client.get(key);
    }
  }

  async set(key: string, value: string, ttlSec?: number): Promise<void> {
    if (!this.state) return;
    if (this.state.type === 'bun') {
      if (ttlSec && ttlSec > 0) {
        await this.state.client.set(key, value, 'EX', ttlSec);
      } else {
        await this.state.client.set(key, value);
      }
    } else {
      if (ttlSec && ttlSec > 0) {
        await this.state.client.set(key, value, { EX: ttlSec });
      } else {
        await this.state.client.set(key, value);
      }
    }
  }

  async incr(key: string): Promise<number> {
    if (!this.state) return 0;
    if (this.state.type === 'bun') {
      return await this.state.client.incr(key);
    } else {
      return await this.state.client.incr(key);
    }
  }

  async onModuleInit() {
    if (this.state) return;

    const url = this.config.get<string>('redis.url');

    if (this.isBun) {
      const { RedisClient } = await import('bun');
      this.state = { type: 'bun', client: new RedisClient(url) };
    } else {
      const { createClient } = await import('redis');
      const client = createClient({ url });
      await client.connect();
      this.state = { type: 'node', client: client as RedisClientType };
    }
  }

  async onModuleDestroy() {
    if (!this.state) return;

    if (this.state.type === 'bun') {
      this.state.client.close();
    } else {
      await this.state.client.quit();
    }
  }
}
