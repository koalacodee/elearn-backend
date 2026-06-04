import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { LoginUseCase } from './application/login.use-case';
import { LogoutUseCase } from './application/logout.use-case';
import { RegisterUseCase } from './application/register.use-case';
import { UserRepository } from './domain/repositories/user.repository';
import { SessionRepository } from './domain/repositories/session.repository';
import { PasswordHasher } from './domain/services/password-hasher';
import authEnv from './env/auth.env';
import { Argon2PasswordHasher } from './infrastructure/argon2-password-hasher';
import { DrizzleUserRepository } from './infrastructure/drizzle-user.repository';
import { RedisSessionRepository } from './infrastructure/redis-session.repository';
import { AuthController } from './interface/auth.controller';
import { AuthGuard } from './interface/guards/auth.guard';
import { RoleGuard } from './interface/guards/role.guard';

@Module({
  imports: [ConfigModule.forFeature(authEnv)],
  controllers: [AuthController],
  providers: [
    RegisterUseCase,
    LoginUseCase,
    LogoutUseCase,
    { provide: UserRepository, useClass: DrizzleUserRepository },
    { provide: SessionRepository, useClass: RedisSessionRepository },
    { provide: PasswordHasher, useClass: Argon2PasswordHasher },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RoleGuard },
  ],
  exports: [UserRepository, SessionRepository],
})
export class AuthModule {}
