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

type MemoryEntry = {
  value: RateLimitState;
  expiresAt: number;
};

const memoryStore = new Map<string, MemoryEntry>();

let redisClient: Redis | null | undefined;

function getEnvValue(...names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }

  return undefined;
}

function getRedisClient(): Redis | null {
  if (redisClient !== undefined) return redisClient;

  const url = getEnvValue(
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_KV_REST_API_URL",
  );

  const token = getEnvValue(
    "UPSTASH_REDIS_REST_TOKEN",
    "UPSTASH_REDIS_REST_KV_REST_API_TOKEN",
  );

  if (!url || !token) {
    redisClient = null;
    return redisClient;
  }

  redisClient = new Redis({ url, token });
  return redisClient;
}

function now(): number {
  return Date.now();
}

function getWindowTtlSeconds(config: RateLimitConfig): number {
  const ttlMs = Math.max(config.windowMs, config.blockDurationMs);
  return Math.ceil(ttlMs / 1000);
}

function getWindowTtlMs(config: RateLimitConfig): number {
  return getWindowTtlSeconds(config) * 1000;
}

function readMemoryState(key: string): RateLimitState | null {
  const currentTime = now();
  const entry = memoryStore.get(key);

  if (!entry) return null;

  if (currentTime >= entry.expiresAt) {
    memoryStore.delete(key);
    return null;
  }

  return entry.value;
}

function writeMemoryState(
  key: string,
  value: RateLimitState,
  config: RateLimitConfig,
): void {
  memoryStore.set(key, {
    value,
    expiresAt: now() + getWindowTtlMs(config),
  });
}

function deleteMemoryState(key: string): void {
  memoryStore.delete(key);
}

function warnRateLimitFallback(error: unknown): void {
  if (process.env.NODE_ENV === "production") return;
  console.warn("[rate-limit] Using memory fallback because Redis is unavailable.", error);
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
  const redis = getRedisClient();

  if (!redis) return readMemoryState(key);

  try {
    return await redis.get<RateLimitState>(key);
  } catch (error) {
    warnRateLimitFallback(error);
    return readMemoryState(key);
  }
}

async function setRateLimitState(
  key: string,
  value: RateLimitState,
  config: RateLimitConfig,
): Promise<void> {
  writeMemoryState(key, value, config);

  const redis = getRedisClient();
  if (!redis) return;

  try {
    await redis.set(key, value, {
      ex: getWindowTtlSeconds(config),
    });
  } catch (error) {
    warnRateLimitFallback(error);
  }
}

export async function assertRateLimit(
  key: string,
  config: RateLimitConfig,
): Promise<void> {
  const currentTime = now();
  const state = await getRateLimitState(key);

  if (!state) return;

  if (state.blockedUntil && currentTime < state.blockedUntil) {
    throw new AppError(
      "RATE_LIMITED",
      "Demasiados intentos. Inténtalo de nuevo en unos minutos.",
      429,
    );
  }

  if (currentTime - state.windowStart >= config.windowMs) {
    await clearRateLimit(key);
  }
}

export async function recordRateLimitFailure(
  key: string,
  config: RateLimitConfig,
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
  deleteMemoryState(key);

  const redis = getRedisClient();
  if (!redis) return;

  try {
    await redis.del(key);
  } catch (error) {
    warnRateLimitFallback(error);
  }
}
