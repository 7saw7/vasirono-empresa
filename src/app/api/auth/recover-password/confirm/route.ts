import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/handle-route";
import { parseWithSchema } from "@/lib/validation/parse";
import { confirmPasswordResetSchema } from "@/features/auth/schema";
import { confirmPasswordResetWithAuthService } from "@/lib/auth/auth-service-client";
import { assertRateLimit, getRequestIp } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    const input = parseWithSchema(
      confirmPasswordResetSchema,
      await request.json(),
      "La solicitud de recuperación no es válida."
    );
    const ip = getRequestIp(request.headers);
    await assertRateLimit(`auth:reset-token:confirm:ip:${ip}`, {
      limit: 10,
      windowMs: 60 * 60 * 1000,
      blockDurationMs: 60 * 60 * 1000,
    });

    return confirmPasswordResetWithAuthService(input, request.headers);
  });
}
