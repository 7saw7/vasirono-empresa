import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/handle-route";
import { parseWithSchema } from "@/lib/validation/parse";
import { businessInvitationAcceptSchema } from "@/features/auth/schema";
import {
  acceptBusinessInvitationWithAuthService,
  type AuthServicePrincipal,
} from "@/lib/auth/auth-service-client";
import { setAuthServiceSessionCookies } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    const body = await request.json();

    const input = parseWithSchema(
      businessInvitationAcceptSchema,
      body,
      "No se pudo activar la cuenta empresa."
    );

    const result = await acceptBusinessInvitationWithAuthService(
      {
        token: input.token,
        name: input.name,
        phone: input.phone,
        password: input.password,
      },
      request.headers
    );

    if (result.session && result.refreshToken && result.principal) {
      await setAuthServiceSessionCookies({
        principal: result.principal as AuthServicePrincipal,
        session: result.session,
        refreshToken: result.refreshToken,
      });
    }

    return {
      accepted: result.accepted,
      invitation: result.invitation,
      user: result.user,
      companyAccess: result.companyAccess,
      loginRequired: result.loginRequired,
    };
  });
}
