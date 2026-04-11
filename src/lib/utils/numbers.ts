export function formatNumber(value: number | null | undefined): string {
  return new Intl.NumberFormat("es-PE").format(value ?? 0);
}

export function formatCompactNumber(value: number | null | undefined): string {
  return new Intl.NumberFormat("es-PE", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value ?? 0);
}

export function formatPercent(
  value: number | null | undefined,
  fractionDigits = 2
): string {
  return `${(value ?? 0).toFixed(fractionDigits)}%`;
}

export function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}