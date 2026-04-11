import type { CompanyVerificationData } from "./types";

export async function getCompanyVerifications(): Promise<CompanyVerificationData> {
  const response = await fetch("/api/admin-company/verifications", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const payload = await response.json();

  if (!response.ok || !payload?.success) {
    throw new Error(
      payload?.error?.message || "No se pudo cargar la verificación."
    );
  }

  return payload.data as CompanyVerificationData;
}