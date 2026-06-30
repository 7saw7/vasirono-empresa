import { handleRoute } from "@/lib/http/handle-route";
import { clearSessionCookie, getRawSessionToken } from "@/lib/auth/session";
import { logoutFromAuthService } from "@/lib/auth/auth-service-client";

export const runtime = "nodejs";

export async function POST() {
  return handleRoute(async () => {
    const rawToken = await getRawSessionToken();

    await logoutFromAuthService(rawToken);
    await clearSessionCookie();

    return {
      loggedOut: true,
    };
  });
}
