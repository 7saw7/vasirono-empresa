export type AnyRecord = Record<string, any>;

export function asRecord(value: unknown): AnyRecord {
  return value && typeof value === "object" ? (value as AnyRecord) : {};
}

export function asArray(value: unknown): AnyRecord[] {
  if (Array.isArray(value)) return value.map(asRecord);
  return [];
}

export function pick<T = unknown>(
  row: AnyRecord,
  ...keys: string[]
): T | undefined {
  for (const key of keys) {
    const value = row[key];

    if (value !== undefined && value !== null) return value as T;
  }

  return undefined;
}

export function unwrapList(value: unknown, ...keys: string[]): AnyRecord[] {
  if (Array.isArray(value)) return asArray(value);

  const row = asRecord(value);

  for (const key of keys) {
    const candidate = row[key];

    if (Array.isArray(candidate)) return asArray(candidate);
  }

  return [];
}

export function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function toNullableNumber(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function toStringValue(value: unknown, fallback = ""): string {
  if (value === undefined || value === null) return fallback;
  return String(value);
}

export function toBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "si", "sí"].includes(normalized)) return true;
    if (["false", "0", "no"].includes(normalized)) return false;
  }

  return fallback;
}

export function toTone(value: unknown) {
  const normalized = toStringValue(value, "default");

  if (["default", "success", "warning", "danger", "info"].includes(normalized)) {
    return normalized as "default" | "success" | "warning" | "danger" | "info";
  }

  return "default";
}

export function toIsoString(value: unknown): string {
  const normalized = toNullableIsoString(value);
  return normalized ?? new Date().toISOString();
}

export function toNullableIsoString(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;

  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}
