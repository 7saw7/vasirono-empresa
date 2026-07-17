import type {
  AcceptBusinessInvitationInput,
  AuthUser,
  BusinessInvitationAcceptResult,
  BusinessInvitationPreview,
  LoginInput,
} from "./types";

export async function loginService(input: LoginInput): Promise<AuthUser> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const payload = await response.json();

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.error?.message || "No se pudo iniciar sesión.");
  }

  return payload.data.user as AuthUser;
}

export async function logoutService(): Promise<void> {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
  });

  const payload = await response.json();

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.error?.message || "No se pudo cerrar sesión.");
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const response = await fetch("/api/auth/me", {
    method: "GET",
    cache: "no-store",
  });

  if (response.status === 401) return null;

  const payload = await response.json();

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.error?.message || "No se pudo obtener la sesión.");
  }

  return payload.data as AuthUser;
}
export async function recoverPasswordService(email: string): Promise<void> {
  const response = await fetch("/api/auth/recover-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const payload = await response.json();

  if (!response.ok || !payload?.success) {
    throw new Error(
      payload?.error?.message || "No se pudo iniciar la recuperación."
    );
  }
}

export async function verifyPasswordResetTokenService(token: string): Promise<void> {
  const response = await fetch("/api/auth/recover-password/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  const payload = await response.json();

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.error?.message || "El enlace no es válido o expiró.");
  }
}

export async function confirmPasswordResetService(input: {
  token: string;
  newPassword: string;
}): Promise<void> {
  const response = await fetch("/api/auth/recover-password/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const payload = await response.json();

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.error?.message || "No se pudo cambiar la contraseña.");
  }
}


export class ClientApiError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ClientApiError";
  }
}

export async function previewBusinessInvitationService(
  token: string
): Promise<BusinessInvitationPreview> {
  const searchParams = new URLSearchParams({ token });
  const response = await fetch(
    `/api/auth/business-invitations/preview?${searchParams.toString()}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  const payload = await response.json();

  if (!response.ok || !payload?.success) {
    throw new ClientApiError(
      payload?.error?.message || "La invitación no es válida o expiró.",
      payload?.error?.code,
      response.status,
    );
  }

  return payload.data as BusinessInvitationPreview;
}

export async function acceptBusinessInvitationService(
  input: AcceptBusinessInvitationInput
): Promise<BusinessInvitationAcceptResult> {
  const response = await fetch("/api/auth/business-invitations/accept", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const payload = await response.json();

  if (!response.ok || !payload?.success) {
    throw new ClientApiError(
      payload?.error?.message || "No se pudo activar la cuenta empresa.",
      payload?.error?.code,
      response.status,
    );
  }

  return payload.data as BusinessInvitationAcceptResult;
}
