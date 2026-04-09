import type { UpsertBranchInput } from "./types";

export function validateUpsertBranchInput(input: UpsertBranchInput) {
  const errors: Record<string, string[]> = {};

  if (!input.name?.trim()) {
    errors.name = ["El nombre de la sucursal es obligatorio."];
  }

  if (!input.address?.trim()) {
    errors.address = ["La dirección es obligatoria."];
  }

  if (!input.districtId) {
    errors.districtId = ["El distrito es obligatorio."];
  }

  return {
    success: Object.keys(errors).length === 0,
    errors,
  };
}