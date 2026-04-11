import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/handle-route";
import { parseWithSchema } from "@/lib/validation/parse";
import { loginSchema } from "@/features/auth/schema";
import { loginWithCredentialsQuery } from "@/lib/db/queries/auth";
import { setSessionCookie } from "@/lib/auth/session";
import {
  assertRateLimit,
  clearRateLimit,
  getRequestIp,
  recordRateLimitFailure,
} from "@/lib/security/rate-limit";
import { AppError } from "@/lib/errors/app-error";

export const runtime = "nodejs";

const LOGIN_IP_LIMIT = {
  limit: 20,
  windowMs: 15 * 60 * 1000,
  blockDurationMs: 15 * 60 * 1000,
};

const LOGIN_EMAIL_LIMIT = {
  limit: 8,
  windowMs: 15 * 60 * 1000,
  blockDurationMs: 20 * 60 * 1000,
};

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    const body = await request.json();

    const input = parseWithSchema(
      loginSchema,
      body,
      "Credenciales inválidas."
    );

    const ip = getRequestIp(request.headers);
    const normalizedEmail = input.email.trim().toLowerCase();

    const ipKey = `auth:login:ip:${ip}`;
    const emailKey = `auth:login:email:${normalizedEmail}`;
    const ipEmailKey = `auth:login:ip-email:${ip}:${normalizedEmail}`;

    await assertRateLimit(ipKey, LOGIN_IP_LIMIT);
    await assertRateLimit(emailKey, LOGIN_EMAIL_LIMIT);
    await assertRateLimit(ipEmailKey, LOGIN_EMAIL_LIMIT);

    try {
      const result = await loginWithCredentialsQuery(input);

      await clearRateLimit(emailKey);
      await clearRateLimit(ipEmailKey);

      await setSessionCookie(result.accessToken);

      return {
        user: result.user,
      };
    } catch (error) {
      if (error instanceof AppError) {
        if (
          error.code === "INVALID_CREDENTIALS" ||
          error.code === "ACCOUNT_DISABLED"
        ) {
          await recordRateLimitFailure(ipKey, LOGIN_IP_LIMIT);
          await recordRateLimitFailure(emailKey, LOGIN_EMAIL_LIMIT);
          await recordRateLimitFailure(ipEmailKey, LOGIN_EMAIL_LIMIT);
        }
      }

      throw error;
    }
  });
}