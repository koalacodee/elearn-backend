import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DrizzleModule } from './common/drizzle/drizzle.module';
import { RateLimiterModule } from './common/rate-limiter/rate-limiter.module';
import { RedisModule } from './common/redis/redis.module';
import redisConfig from './common/redis/redis.config';
import drizzleEnv from './common/drizzle/drizzle.env';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [redisConfig, drizzleEnv]
    }),
    DrizzleModule,
    RedisModule,
    RateLimiterModule,
  ],
})
export class AppModule {}
