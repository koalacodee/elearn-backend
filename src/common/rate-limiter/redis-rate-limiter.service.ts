import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { RateLimiter } from './rate-limiter.service';

@Injectable()
export class RedisRateLimiter extends RateLimiter {
  constructor(private readonly redis: RedisService) {
    super();
  }

  async consume(
    bucket: string,
    limit: number,
    windowSec: number,
  ): Promise<boolean> {
    const key = `ratelimit:${bucket}`;
    const count = await this.redis.incr(key);
    if (count === 1) {
      await this.redis.expire(key, windowSec);
    }
    return count <= limit;
  }
}
