import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/handle-route";
import { parseWithSchema } from "@/lib/validation/parse";
import { passwordResetTokenSchema } from "@/features/auth/schema";
import { verifyPasswordResetTokenWithAuthService } from "@/lib/auth/auth-service-client";
import { assertRateLimit, getRequestIp } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    const input = parseWithSchema(
      passwordResetTokenSchema,
      await request.json(),
      "El enlace de recuperación no es válido."
    );
    const ip = getRequestIp(request.headers);
    await assertRateLimit(`auth:reset-token:verify:ip:${ip}`, {
      limit: 30,
      windowMs: 15 * 60 * 1000,
      blockDurationMs: 15 * 60 * 1000,
    });

    return verifyPasswordResetTokenWithAuthService(input.token, request.headers);
  });
}
