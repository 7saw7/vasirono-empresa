import type {
  CompanySettings,
  UpdateNotificationPreferencesInput,
} from "./types";

export async function getCompanySettings(): Promise<CompanySettings> {
  const response = await fetch("/api/admin-company/settings", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const payload = await response.json();

  if (!response.ok || !payload?.success) {
    throw new Error(
      payload?.error?.message || "No se pudo cargar la configuración."
    );
  }

  return payload.data as CompanySettings;
}

export async function updateNotificationPreferences(
  input: UpdateNotificationPreferencesInput
): Promise<CompanySettings> {
  const response = await fetch("/api/admin-company/settings", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const payload = await response.json();

  if (!response.ok || !payload?.success) {
    throw new Error(
      payload?.error?.message ||
        "No se pudieron actualizar las preferencias."
    );
  }

  return payload.data as CompanySettings;
}