import { handleRoute } from "@/lib/http/handle-route";
import { requireSession } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function GET() {
  return handleRoute(async () => {
    const session = await requireSession();

    return {
      id: session.userId,
      name: session.name,
      email: session.email,
      companyId: session.companyId,
      role: session.role,
    };
  });
}