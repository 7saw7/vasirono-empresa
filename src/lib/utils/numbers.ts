export function formatNumber(value?: number | null): string {
  return new Intl.NumberFormat("es-PE").format(value ?? 0);
}

export function formatCompactNumber(value?: number | null): string {
  return new Intl.NumberFormat("es-PE", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value ?? 0);
}

export function formatPercent(value?: number | null, decimals = 1): string {
  return `${(value ?? 0).toFixed(decimals)}%`;
}