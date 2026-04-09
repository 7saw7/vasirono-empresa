import type { UpdateCompanyProfileInput } from "./types";

export function validateUpdateCompanyProfileInput(
  input: UpdateCompanyProfileInput
) {
  const errors: Record<string, string[]> = {};

  if (!input.name?.trim()) {
    errors.name = ["El nombre del negocio es obligatorio."];
  }

  if (!input.address?.trim()) {
    errors.address = ["La dirección es obligatoria."];
  }

  if (!input.email?.trim()) {
    errors.email = ["El correo es obligatorio."];
  }

  return {
    success: Object.keys(errors).length === 0,
    errors,
  };
}