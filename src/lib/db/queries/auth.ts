import { AppError } from "@/lib/errors/app-error";
import { loginWithAuthService } from "@/lib/auth/auth-service-client";
import type { LoginInput, LoginResult } from "@/features/auth/types";

/**
 * @deprecated El panel empresarial ya no autentica contra la BD ni emite JWT
 * local. Se mantiene este adapter por compatibilidad, pero delega el login al
 * auth-service, que emite tokens opacos y persiste sesiones en user_sessions.
 */
export async function loginWithCredentialsQuery(
  input: LoginInput
): Promise<LoginResult> {
  const result = await loginWithAuthService(input);
  const principal = result.principal;

  if (!result.session.token) {
    throw new AppError(
      "AUTH_SERVICE_INVALID_RESPONSE",
      "El auth-service no devolvió una sesión válida.",
      502
    );
  }

  return {
    accessToken: result.session.token,
    user: {
      id: principal.user.id,
      name: principal.user.name,
      email: principal.user.email,
      companyId: principal.activeCompanyId,
      role: principal.activeRole,
    },
  };
}
