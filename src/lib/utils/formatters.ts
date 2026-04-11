import { formatCompactNumber, formatNumber, formatPercent } from "./numbers";

export function formatPhone(value: string | null | undefined): string {
  if (!value) return "—";
  return value.trim();
}

export function formatEmail(value: string | null | undefined): string {
  if (!value) return "—";
  return value.trim().toLowerCase();
}

export function formatUrl(value: string | null | undefined): string {
  if (!value) return "—";
  return value.trim();
}

export function formatScore(value: number | null | undefined): string {
  return (value ?? 0).toFixed(1);
}

export function formatRating(value: number | null | undefined): string {
  return `${(value ?? 0).toFixed(1)} / 5`;
}

export function formatKpiValue(
  value: number | string | null | undefined,
  mode: "number" | "compact" | "percent" | "text" = "text"
): string {
  if (typeof value === "string") return value;

  switch (mode) {
    case "number":
      return formatNumber(value);
    case "compact":
      return formatCompactNumber(value);
    case "percent":
      return formatPercent(value);
    default:
      return String(value ?? "—");
  }
}