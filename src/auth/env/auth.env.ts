import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  sessionTtlSec: parseInt(process.env.AUTH_SESSION_TTL_SEC ?? '604800', 10),
  cookieName: process.env.AUTH_COOKIE_NAME ?? 'sid',
  cookieSecure: process.env.AUTH_COOKIE_SECURE === 'true',
  cookieDomain: process.env.AUTH_COOKIE_DOMAIN ?? undefined,
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
}));
