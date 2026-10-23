import { getProseLocaleText, type ProseLocale } from "./locale";
import type { FilterGroup } from "@fn-sphere/filter";
import { createProseRule } from "./schema";

export type ProseDocument = {
  filterRule: FilterGroup;
};
export type HistoryState = {
  past: ProseDocument[];
  present: ProseDocument;
  future: ProseDocument[];
};
export type HistoryAction =
  | { type: "commit"; document: ProseDocument }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "reset" };
export const createDocument = (): ProseDocument => ({
  filterRule: createProseRule(),
});
export const createHistory = (): HistoryState => ({
  past: [],
  present: createDocument(),
  future: [],
});

export function historyReducer(
  state: HistoryState,
  action: HistoryAction,
): HistoryState {
  if (action.type === "undo") {
    const previous = state.past.at(-1);
    return previous
      ? {
          past: state.past.slice(0, -1),
          present: previous,
          future: [state.present, ...state.future],
        }
      : state;
  }
  if (action.type === "redo") {
    const next = state.future[0];
    return next
      ? {
          past: [...state.past, state.present].slice(-100),
          present: next,
          future: state.future.slice(1),
        }
      : state;
  }
  const next = action.type === "reset" ? createDocument() : action.document;
  if (JSON.stringify(next) === JSON.stringify(state.present)) return state;
  return {
    past: [...state.past, state.present].slice(-100),
    present: structuredClone(next),
    future: [],
  };
}

export function listSeparator(
  index: number,
  count: number,
  negative: boolean,
  locale: ProseLocale = "en-US",
) {
  if (index === 0) return "";
  const conjunction = negative ? "Nor" : "Or";
  const key =
    index === count - 1
      ? count > 2
        ? `list.serial${conjunction}`
        : `list.${conjunction.toLowerCase()}`
      : "list.middle";
  return getProseLocaleText(locale, key);
}

export function membershipOperator(
  negative: boolean,
  count: number,
  locale: ProseLocale = "en-US",
) {
  return getProseLocaleText(
    locale,
    negative
      ? count > 1
        ? "member.negativeMany"
        : "member.negative"
      : "member.positive",
  );
}

export function formatValue(
  value: unknown,
  locale: ProseLocale = "en-US",
): string {
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
