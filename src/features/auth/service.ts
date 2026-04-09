import type { LoginInput, LoginResult } from "./types";
import { validateLoginInput } from "./schema";

export async function login(input: LoginInput): Promise<LoginResult> {
  const validation = validateLoginInput(input);

  if (!validation.success) {
    throw new Error("Credenciales inválidas.");
  }

  /**
   * Default temporal.
   * Luego lo conectamos con tu endpoint real.
   */
  return {
    user: {
      id: "demo-user-id",
      name: "Admin Empresa Demo",
      email: input.email,
      role: "company_admin",
      companyId: 1,
    },
    token: "demo-token",
  };
}

export async function logout(): Promise<void> {
  return;
}

export async function getMe() {
  return {
    id: "demo-user-id",
    name: "Admin Empresa Demo",
    email: "empresa@vasirono.com",
    role: "company_admin",
    companyId: 1,
  };
}