import { Request, Response, NextFunction } from "express";
import { RateLimitStatus } from "./types";

interface WindowBucket {
  timestamps: number[];
}

const memoryStore = new Map<string, WindowBucket>();

export interface RateLimiterOptions {
  windowMs: number; // e.g. 60,000 ms (1 minute)
  maxRequests: number; // e.g. 60 requests
  keyGenerator?: (req: Request) => string;
  message?: string;
  statusCode?: number;
}

/**
 * Creates a sliding-window rate limiter middleware
 */
export function createRateLimiter(options: RateLimiterOptions) {
  const {
    windowMs,
    maxRequests,
    keyGenerator = (req) => (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1",
    message = "API Gateway Rate Limit Exceeded. Please slow down your requests.",
    statusCode = 429
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req);
    const now = Date.now();
    const windowStart = now - windowMs;

    let bucket = memoryStore.get(key);
    if (!bucket) {
      bucket = { timestamps: [] };
      memoryStore.set(key, bucket);
    }

    // Filter out timestamps older than the sliding window
    bucket.timestamps = bucket.timestamps.filter(ts => ts > windowStart);

    const currentCount = bucket.timestamps.length;
    const remaining = Math.max(0, maxRequests - currentCount);
    const oldestTimestamp = bucket.timestamps[0] || now;
    const resetTimeSeconds = Math.ceil((oldestTimestamp + windowMs - now) / 1000);

    // Set standard rate limit headers
    res.setHeader("X-RateLimit-Limit", maxRequests.toString());
    res.setHeader("X-RateLimit-Remaining", remaining.toString());
    res.setHeader("X-RateLimit-Reset", resetTimeSeconds.toString());
    res.setHeader("Retry-After", resetTimeSeconds.toString());

    if (currentCount >= maxRequests) {
      return res.status(statusCode).json({
        type: "https://cura.in/errors/rate-limit-exceeded",
        title: "Too Many Requests",
        status: 429,
        detail: message,
        limit: maxRequests,
        windowSeconds: Math.round(windowMs / 1000),
        retryAfterSeconds: resetTimeSeconds,
        timestamp: new Date().toISOString()
      });
    }

    // Record request timestamp
    bucket.timestamps.push(now);
    next();
  };
}

/**
 * Check rate limit status for an identifier without consuming tokens (inspection)
 */
export function getRateLimitStatus(
  identifier: string, 
  windowMs = 60000, 
  maxRequests = 60
): RateLimitStatus {
  const now = Date.now();
  const windowStart = now - windowMs;
  const bucket = memoryStore.get(identifier);
  const timestamps = (bucket ? bucket.timestamps : []).filter(ts => ts > windowStart);
  
  const currentCount = timestamps.length;
  const remaining = Math.max(0, maxRequests - currentCount);
  const oldestTimestamp = timestamps[0] || now;
  const resetSeconds = Math.max(0, Math.ceil((oldestTimestamp + windowMs - now) / 1000));

  return {
    ip: identifier,
    limit: maxRequests,
    remaining,
    resetSeconds,
    isThrottled: currentCount >= maxRequests,
    totalHits: currentCount
  };
}

/**
 * Reset rate limit counter for an IP / identifier (useful in testing)
 */
export function resetRateLimit(identifier: string) {
  memoryStore.delete(identifier);
}
