import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/handle-route";
import { parseWithSchema } from "@/lib/validation/parse";
import { recoverPasswordSchema } from "@/features/auth/schema";
import { requestPasswordResetWithAuthService } from "@/lib/auth/auth-service-client";
import {
  assertRateLimit,
  getRequestIp,
  recordRateLimitFailure,
} from "@/lib/security/rate-limit";
import { AppError } from "@/lib/errors/app-error";

export const runtime = "nodejs";

const RECOVER_PASSWORD_LIMIT = {
  limit: 5,
  windowMs: 60 * 60 * 1000,
  blockDurationMs: 60 * 60 * 1000,
};

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    const body = await request.json();
    const input = parseWithSchema(
      recoverPasswordSchema,
      body,
      "Correo inválido."
    );

    const ip = getRequestIp(request.headers);
    const normalizedEmail = input.email.trim().toLowerCase();
    const ipKey = `auth:recover-password:ip:${ip}`;
    const emailKey = `auth:recover-password:email:${normalizedEmail}`;

    await assertRateLimit(ipKey, RECOVER_PASSWORD_LIMIT);
    await assertRateLimit(emailKey, RECOVER_PASSWORD_LIMIT);

    try {
      await requestPasswordResetWithAuthService(input.email, request.headers);

      return {
        sent: true,
      };
    } catch (error) {
      if (error instanceof AppError && error.status < 500) {
        await recordRateLimitFailure(ipKey, RECOVER_PASSWORD_LIMIT);
        await recordRateLimitFailure(emailKey, RECOVER_PASSWORD_LIMIT);
      }

      throw error;
    }
  });
}
