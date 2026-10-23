export function listSeparatorKey(
  index: number,
  count: number,
  negative: boolean,
) {
  if (index === 0) return "";
  const conjunction = negative ? "Nor" : "Or";
  const key =
    index === count - 1
      ? count > 2
        ? `list.serial${conjunction}`
        : `list.${conjunction.toLowerCase()}`
      : "list.middle";
  return key;
}

export function membershipOperatorKey(negative: boolean, count: number) {
  return negative
    ? count > 1
      ? "member.negativeMany"
      : "member.negative"
    : "member.positive";
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
