import { AppError } from "@/lib/errors/app-error";
import type { CompanyProfile, UpdateCompanyProfileInput } from "./types";

function isNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidUrl(value: string) {
  if (!value.trim()) return true;

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function validateUpdateCompanyProfileInput(
  input: unknown
): UpdateCompanyProfileInput {
  if (!input || typeof input !== "object") {
    throw new AppError(
      "VALIDATION_ERROR",
      "El payload del perfil del negocio es inválido.",
      422
    );
  }

  const data = input as Record<string, unknown>;

  const parsed: UpdateCompanyProfileInput = {
    name: String(data.name ?? "").trim(),
    description: String(data.description ?? "").trim(),
    address: String(data.address ?? "").trim(),
    phone: String(data.phone ?? "").trim(),
    email: String(data.email ?? "").trim(),
    website: String(data.website ?? "").trim(),
  };

  const errors: Record<string, string[]> = {};

  if (!isNonEmptyString(parsed.name)) {
    errors.name = ["El nombre del negocio es obligatorio."];
  }

  if (!isNonEmptyString(parsed.address)) {
    errors.address = ["La dirección es obligatoria."];
  }

  if (!isNonEmptyString(parsed.email)) {
    errors.email = ["El correo es obligatorio."];
  } else if (!isValidEmail(parsed.email)) {
    errors.email = ["El correo no tiene un formato válido."];
  }

  if (parsed.website && !isValidUrl(parsed.website)) {
    errors.website = ["El sitio web no tiene un formato válido."];
  }

  if (Object.keys(errors).length > 0) {
    throw new AppError(
      "VALIDATION_ERROR",
      "Datos inválidos para actualizar el perfil del negocio.",
      422,
      errors
    );
  }

  return parsed;
}

export function validateCompanyProfile(input: unknown): CompanyProfile {
  if (!input || typeof input !== "object") {
    throw new AppError(
      "VALIDATION_ERROR",
      "El perfil del negocio recibido no es válido.",
      422
    );
  }

  const data = input as CompanyProfile;

  if (
    !isNonEmptyString(data.companyId) ||
    !isNonEmptyString(data.name) ||
    typeof data.description !== "string" ||
    typeof data.address !== "string" ||
    typeof data.phone !== "string" ||
    typeof data.email !== "string" ||
    typeof data.website !== "string" ||
    typeof data.verificationStatus !== "string" ||
    !Array.isArray(data.media) ||
    !Array.isArray(data.contacts) ||
    !Array.isArray(data.categories)
  ) {
    throw new AppError(
      "VALIDATION_ERROR",
      "El perfil del negocio no cumple el contrato esperado.",
      422
    );
  }

  return data;
}