export function listSeparatorKey(index: number, count: number) {
  if (index === 0) return "";
  if (index !== count - 1) return "list.middle";
  return count > 2 ? "list.serialOr" : "list.or";
}

export function formatValue(value: unknown, locale = "en-US"): string {
  return typeof value === "number"
    ? new Intl.NumberFormat(locale, { maximumFractionDigits: 20 }).format(value)
    : String(value ?? "");
}

export function parseInput(
  value: string,
  type: string | undefined,
): string | number | undefined {
  if (!value.trim()) return undefined;
  if (type !== "number") return value;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}
