export abstract class RateLimiter {
  abstract consume(
    bucket: string,
    limit: number,
    windowSec: number,
  ): Promise<boolean>;
}
