import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import authEnv from './auth/env/auth.env';
import { DrizzleModule } from './common/drizzle/drizzle.module';
import drizzleEnv from './common/drizzle/drizzle.env';
import mediaEnv from './common/media/media.env';
import { RateLimiterModule } from './common/rate-limiter/rate-limiter.module';
import { RedisModule } from './common/redis/redis.module';
import redisConfig from './common/redis/redis.config';
import { QuizzesModule } from './quizzes/quizzes.module';
import { UnitsModule } from './units/units.module';
import { WordsModule } from './words/words.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [redisConfig, drizzleEnv, mediaEnv, authEnv],
    }),
    DrizzleModule,
    RedisModule,
    RateLimiterModule,
    AuthModule,
    UnitsModule,
    WordsModule,
    QuizzesModule,
  ],
})
export class AppModule {}
