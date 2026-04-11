import type { AuthUser, LoginInput } from "./types";

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