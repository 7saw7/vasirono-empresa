import type { DashboardData } from "./types";
import { validateDashboardData } from "./schema";

export async function getDashboardData(): Promise<DashboardData> {
  const response = await fetch("/api/admin-company/dashboard", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const payload = await response.json();

  if (!response.ok || !payload?.success) {
    throw new Error(
      payload?.error?.message || "No se pudo cargar el dashboard."
    );
  }

  return validateDashboardData(payload.data);
}