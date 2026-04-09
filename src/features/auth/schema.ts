import type { LoginInput } from "./types";

export function validateLoginInput(input: LoginInput) {
  const errors: Record<string, string[]> = {};

  if (!input.email?.trim()) {
    errors.email = ["El correo es obligatorio."];
  }

  if (!input.password?.trim()) {
    errors.password = ["La contraseña es obligatoria."];
  }

  return {
    success: Object.keys(errors).length === 0,
    errors,
  };
}