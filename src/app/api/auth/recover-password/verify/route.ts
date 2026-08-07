import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/handle-route";
import { parseWithSchema } from "@/lib/validation/parse";
import { passwordResetCodeSchema } from "@/features/auth/schema";
import { verifyPasswordResetCodeWithAuthService } from "@/lib/auth/auth-service-client";
import { assertRateLimit, getRequestIp } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    const input = parseWithSchema(
      passwordResetCodeSchema,
      await request.json(),
      "El código de recuperación no es válido."
    );
    const ip = getRequestIp(request.headers);
    await assertRateLimit(`auth:reset-token:verify:ip:${ip}`, {
      limit: 30,
      windowMs: 15 * 60 * 1000,
      blockDurationMs: 15 * 60 * 1000,
    });

    return verifyPasswordResetCodeWithAuthService(input, request.headers);
  });
}
