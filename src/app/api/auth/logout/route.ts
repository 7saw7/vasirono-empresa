import { handleRoute } from "@/lib/http/handle-route";
import { clearSessionCookie } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST() {
  return handleRoute(async () => {
    await clearSessionCookie();

    return {
      loggedOut: true,
    };
  });
}