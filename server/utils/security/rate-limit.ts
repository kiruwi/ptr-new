import { createError } from "h3";

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

type BucketState = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  key: string;
  max: number;
  windowMs: number;
};

const buckets = new Map<string, BucketState>();

export function checkRateLimit({ key, max, windowMs }: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, {
      count: 1,
      resetAt,
    });

    return {
      allowed: true,
      remaining: Math.max(max - 1, 0),
      resetAt,
    };
  }

  bucket.count += 1;

  if (bucket.count > max) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: bucket.resetAt,
    };
  }

  return {
    allowed: true,
    remaining: Math.max(max - bucket.count, 0),
    resetAt: bucket.resetAt,
  };
}

export function resetRateLimitStore() {
  buckets.clear();
}

export function assertRateLimit(result: RateLimitResult) {
  if (!result.allowed) {
    throw createError({
      statusCode: 429,
      statusMessage: "Too Many Requests",
      message: "Rate limit exceeded.",
    });
  }
}
