import { Request, Response, NextFunction } from "express";
import { RateLimitError } from "../shared/errors";

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const ipBuckets = new Map<string, RateLimitBucket>();

// Sliding window rate limiter
export function createRateLimiter(options: { maxRequests: number; windowMs: number; name?: string }) {
  const { maxRequests, windowMs } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown_ip";
    const key = `${options.name || "default"}:${ip}`;
    const now = Date.now();

    let bucket = ipBuckets.get(key);
    if (!bucket || now > bucket.resetAt) {
      bucket = { count: 1, resetAt: now + windowMs };
      ipBuckets.set(key, bucket);
    } else {
      bucket.count++;
    }

    res.setHeader("X-RateLimit-Limit", maxRequests.toString());
    res.setHeader("X-RateLimit-Remaining", Math.max(0, maxRequests - bucket.count).toString());
    res.setHeader("X-RateLimit-Reset", Math.ceil(bucket.resetAt / 1000).toString());

    if (bucket.count > maxRequests) {
      return next(new RateLimitError(`Rate limit exceeded. Try again in ${Math.ceil((bucket.resetAt - now) / 1000)} seconds.`));
    }

    next();
  };
}

export const standardRateLimiter = createRateLimiter({ maxRequests: 300, windowMs: 60 * 1000, name: "std" });
export const authRateLimiter = createRateLimiter({ maxRequests: 150, windowMs: 60 * 1000, name: "auth" });
export const aiRateLimiter = createRateLimiter({ maxRequests: 60, windowMs: 60 * 1000, name: "ai" });
