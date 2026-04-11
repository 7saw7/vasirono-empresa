import { Redis } from "@upstash/redis";
import { AppError } from "@/lib/errors/app-error";

type RateLimitConfig = {
  limit: number;
  windowMs: number;
  blockDurationMs: number;
};

type RateLimitState = {
  count: number;
  windowStart: number;
  blockedUntil: number | null;
};

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

function now(): number {
  return Date.now();
}

function getWindowTtlSeconds(config: RateLimitConfig): number {
  const ttlMs = Math.max(config.windowMs, config.blockDurationMs);
  return Math.ceil(ttlMs / 1000);
}

export function getRequestIp(headers: Headers): string {
  const cfConnectingIp = headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();

  const xForwardedFor = headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0]?.trim() || "unknown";
  }

  const xRealIp = headers.get("x-real-ip");
  if (xRealIp) return xRealIp.trim();

  return "unknown";
}

async function getRateLimitState(key: string): Promise<RateLimitState | null> {
  return await redis.get<RateLimitState>(key);
}

async function setRateLimitState(
  key: string,
  value: RateLimitState,
  config: RateLimitConfig
): Promise<void> {
  await redis.set(key, value, {
    ex: getWindowTtlSeconds(config),
  });
}

export async function assertRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<void> {
  const currentTime = now();
  const state = await getRateLimitState(key);

  if (!state) return;

  if (state.blockedUntil && currentTime < state.blockedUntil) {
    throw new AppError(
      "RATE_LIMITED",
      "Demasiados intentos. Inténtalo de nuevo en unos minutos.",
      429
    );
  }

  if (currentTime - state.windowStart >= config.windowMs) {
    await redis.del(key);
  }
}

export async function recordRateLimitFailure(
  key: string,
  config: RateLimitConfig
): Promise<void> {
  const currentTime = now();
  const state = await getRateLimitState(key);

  if (!state || currentTime - state.windowStart >= config.windowMs) {
    const nextState: RateLimitState = {
      count: 1,
      windowStart: currentTime,
      blockedUntil: null,
    };

    await setRateLimitState(key, nextState, config);
    return;
  }

  const nextCount = state.count + 1;
  const shouldBlock = nextCount >= config.limit;

  const nextState: RateLimitState = {
    count: nextCount,
    windowStart: state.windowStart,
    blockedUntil: shouldBlock ? currentTime + config.blockDurationMs : null,
  };

  await setRateLimitState(key, nextState, config);
}

export async function clearRateLimit(key: string): Promise<void> {
  await redis.del(key);
}