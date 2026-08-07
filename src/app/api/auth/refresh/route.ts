import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/handle-route";
import { refreshCurrentSession } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    const session = await refreshCurrentSession(request.headers);

    return {
      user: {
        id: session.userId,
        name: session.name,
        email: session.email,
        companyId: session.companyId,
        role: session.role,
      },
      sessionId: session.sessionId,
      expiresAt: session.expiresAt,
    };
  });
}
