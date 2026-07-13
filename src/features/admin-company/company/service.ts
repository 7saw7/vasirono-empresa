import {
  validateCompanyProfile,
  validateCompanyTaxonomy,
} from "./schema";
import type {
  CompanyProfile,
  CompanyTaxonomy,
  UpdateCompanyProfileInput,
  UpdateCompanyTaxonomyInput,
} from "./types";

async function readPayload(response: Response) {
  return response.json().catch(() => null);
}

export async function getCompanyProfile(): Promise<CompanyProfile> {
  const response = await fetch("/api/admin-company/company", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  const payload = await readPayload(response);
  if (!response.ok || !payload?.success) {
    throw new Error(
      payload?.error?.message || "No se pudo cargar el perfil del negocio."
    );
  }

  return validateCompanyProfile(payload.data);
}

export async function updateCompanyProfile(
  input: UpdateCompanyProfileInput
): Promise<CompanyProfile> {
  const response = await fetch("/api/admin-company/company", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const payload = await readPayload(response);
  if (!response.ok || !payload?.success) {
    throw new Error(
      payload?.error?.message || "No se pudo actualizar el perfil del negocio."
    );
  }

  return validateCompanyProfile(payload.data);
}

export async function updateCompanyTaxonomy(
  input: UpdateCompanyTaxonomyInput
): Promise<CompanyTaxonomy> {
  const response = await fetch("/api/admin-company/company/taxonomy", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const payload = await readPayload(response);
  if (!response.ok || !payload?.success) {
    throw new Error(
      payload?.error?.message || "No se pudo actualizar la clasificación del negocio."
    );
  }

  return validateCompanyTaxonomy(payload.data);
}
