import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";

type Bucket = {
  count: number;
  resetAt: number;
};

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly buckets = new Map<string, Bucket>();
  private readonly windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000);
  private readonly defaultMax = Number(process.env.RATE_LIMIT_MAX ?? 180);
  private readonly authMax = Number(process.env.AUTH_RATE_LIMIT_MAX ?? 30);

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{
      ip?: string;
      method?: string;
      route?: { path?: string };
      originalUrl?: string;
      socket?: { remoteAddress?: string };
    }>();
    const url = request.originalUrl ?? request.route?.path ?? "";
    const limit = url.includes("/api/auth/") ? this.authMax : this.defaultMax;
    const identity = request.ip ?? request.socket?.remoteAddress ?? "unknown";
    const key = `${identity}:${request.method}:${url}`;
    const now = Date.now();
    const bucket = this.buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + this.windowMs });
      this.cleanup(now);
      return true;
    }

    bucket.count += 1;
    if (bucket.count > limit) {
      throw new HttpException("Too many requests. Please wait and try again.", HttpStatus.TOO_MANY_REQUESTS);
    }

    return true;
  }

  private cleanup(now: number) {
    if (this.buckets.size < 1000) {
      return;
    }

    for (const [key, bucket] of this.buckets.entries()) {
      if (bucket.resetAt <= now) {
        this.buckets.delete(key);
      }
    }
  }
}
