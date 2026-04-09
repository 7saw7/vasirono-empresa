export function formatPhone(value?: string | null): string {
  if (!value) return "—";
  return value;
}

export function formatCurrency(
  value?: number | null,
  currency: string = "PEN"
): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value ?? 0);
}

export function formatBoolean(value?: boolean | null): string {
  if (value === true) return "Sí";
  if (value === false) return "No";
  return "—";
}