import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { RateLimiter } from '../../common/rate-limiter/rate-limiter.service';
import { LoginUseCase } from '../application/login.use-case';
import { LogoutUseCase } from '../application/logout.use-case';
import { RegisterUseCase } from '../application/register.use-case';
import { User } from '../domain/user.entity';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';

interface MeResponse {
  id: string;
  phone: string;
  name: string;
  role: string;
  createdAt: string;
}

function toMeResponse(user: User): MeResponse {
  return {
    id: user.id,
    phone: user.phone,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly config: ConfigService,
    private readonly rateLimiter: RateLimiter,
  ) {}

  private setSessionCookie(
    reply: FastifyReply,
    sessionId: string,
    ttlSec: number,
  ) {
    reply.setCookie(
      this.config.getOrThrow<string>('auth.cookieName'),
      sessionId,
      {
        httpOnly: true,
        sameSite: 'lax',
        secure: this.config.getOrThrow<boolean>('auth.cookieSecure'),
        domain: this.config.get<string | undefined>('auth.cookieDomain'),
        maxAge: ttlSec,
        path: '/',
      },
    );
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<MeResponse> {
    const ttl = this.config.getOrThrow<number>('auth.sessionTtlSec');
    const { user, session } = await this.registerUseCase.execute({
      phone: dto.phone,
      password: dto.password,
      name: dto.name,
      sessionTtlSec: ttl,
    });
    this.setSessionCookie(reply, session.id, ttl);
    return toMeResponse(user);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<MeResponse> {
    const allowed = await this.rateLimiter.consume(`login:${dto.phone}`, 5, 60);
    if (!allowed)
      throw new HttpException(
        'too_many_attempts',
        HttpStatus.TOO_MANY_REQUESTS,
      );

    const ttl = this.config.getOrThrow<number>('auth.sessionTtlSec');
    const { user, session } = await this.loginUseCase.execute({
      phone: dto.phone,
      password: dto.password,
      sessionTtlSec: ttl,
    });
    this.setSessionCookie(reply, session.id, ttl);
    return toMeResponse(user);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<void> {
    const cookieName = this.config.getOrThrow<string>('auth.cookieName');
    const sessionId = req.cookies?.[cookieName];
    if (sessionId) await this.logoutUseCase.execute(sessionId);
    reply.clearCookie(cookieName, { path: '/' });
  }

  @Get('me')
  me(@CurrentUser() user: User | undefined): MeResponse {
    if (!user) throw new UnauthorizedException('not_authenticated');
    return toMeResponse(user);
  }
}
