import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/handle-route";
import { parseWithSchema } from "@/lib/validation/parse";
import { businessInvitationPreviewSchema } from "@/features/auth/schema";
import { previewBusinessInvitationWithAuthService } from "@/lib/auth/auth-service-client";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    const token = request.nextUrl.searchParams.get("token") ?? "";

    const input = parseWithSchema(
      businessInvitationPreviewSchema,
      { token },
      "La invitación no es válida."
    );

    return previewBusinessInvitationWithAuthService({
      token: input.token,
      requestHeaders: request.headers,
    });
  });
}
