import { Global, Module } from '@nestjs/common';
import { RateLimiter } from './rate-limiter.service';
import { RedisRateLimiter } from './redis-rate-limiter.service';

@Global()
@Module({
  providers: [{ provide: RateLimiter, useClass: RedisRateLimiter }],
  exports: [RateLimiter],
})
export class RateLimiterModule {}
