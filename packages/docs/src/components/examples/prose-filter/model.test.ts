import { messages, type ProseLocale } from "./locales/locale";
import { expect, test } from "vitest";
import {
  createFilterPredicate,
  presetFilter,
  createFilterGroup,
  createSingleFilter,
  type FilterGroup,
} from "@fn-sphere/filter";
import { formatValue, listSeparatorKey, parseInput } from "./theme/model";
import { createDefaultGroup, expenseSchema, type Expense } from "./schema";

const listSeparator = (
  index: number,
  count: number,
  locale: ProseLocale = "en-US",
) => messages[locale][listSeparatorKey(index, count)] ?? "";

const expense: Expense = {
  seniority: "Manager",
  department: "Sales",
  expenseType: "Software",
  merchant: "Uber",
  currency: "EUR",
  amount: 600,
};
const predicate = (filterRule: FilterGroup) =>
  createFilterPredicate({
    schema: expenseSchema,
    filterFnList: presetFilter,
    filterRule,
  });

test("the default AND / OR rule and group changes use real filter semantics", () => {
  const rule = createDefaultGroup();
  expect(predicate(rule)(expense)).toBe(true);
  expect(predicate(rule)({ ...expense, seniority: "Contributor" })).toBe(false);
  const group = rule.conditions[1] as FilterGroup;
  group.op = "and";
  expect(predicate(rule)(expense)).toBe(false);
  expect(
    predicate(rule)({ ...expense, expenseType: "Travel", currency: "USD" }),
  ).toBe(true);
  rule.op = "or";
  expect(predicate(rule)(expense)).toBe(true);
});

test("notContains excludes every selected department", () => {
  const rule = createFilterGroup({
    op: "and",
    conditions: [
      createSingleFilter({
        path: ["department"],
        name: "notContains",
        args: [["Sales", "Marketing"]],
      }),
    ],
  });
  expect(predicate(rule)(expense)).toBe(false);
  expect(predicate(rule)({ ...expense, department: "Marketing" })).toBe(false);
  expect(predicate(rule)({ ...expense, department: "Engineering" })).toBe(true);
});

test("membership prose handles no, one, two and three values", () => {
  const sentence = (values: string[]) =>
    values.map((value, i) => listSeparator(i, values.length) + value).join("");
  expect(sentence([])).toBe("");
  expect(sentence(["Sales"])).toBe("Sales");
  expect(sentence(["Sales", "Marketing"])).toBe("Sales or Marketing");
  expect(sentence(["Sales", "Marketing", "Finance"])).toBe(
    "Sales, Marketing, or Finance",
  );
});

test("number formatting never changes stored numeric input", () => {
  expect(formatValue(5000)).toBe("5,000");
  expect(parseInput("0", "number")).toBe(0);
  expect(parseInput("", "number")).toBeUndefined();
  expect(parseInput(" ", "number")).toBeUndefined();
  expect(parseInput("Infinity", "number")).toBeUndefined();
  expect(parseInput("oops", "number")).toBeUndefined();
  expect(parseInput("WeWork", "text")).toBe("WeWork");
});

test("membership connectors and numeric display honor the selected locale", () => {
  expect(listSeparator(1, 2, "zh-CN")).toBe("或");
  expect(listSeparator(1, 2, "ja-JP")).toBe("または");
  expect(formatValue(5000.5, "ja-JP")).toBe(
    new Intl.NumberFormat("ja-JP").format(5000.5),
  );
});

test("locale dictionaries extend the built-in messages", () => {
  expect(messages["zh-CN"].addRule).toBe("\u6dfb\u52a0\u89c4\u5219");
  expect(messages["ja-JP"]["Manager"]).toBe(
    "\u30de\u30cd\u30fc\u30b8\u30e3\u30fc",
  );
});
