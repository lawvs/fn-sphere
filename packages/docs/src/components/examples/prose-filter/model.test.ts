import { messages, type ProseLocale } from "./locale";
import { expect, test } from "vitest";
import {
  createFilterPredicate,
  presetFilter,
  createFilterGroup,
  createSingleFilter,
  type FilterGroup,
} from "@fn-sphere/filter";
import {
  formatValue,
  listSeparatorKey,
  membershipOperatorKey,
  parseInput,
} from "./theme/model";
import { createProseRule, expenseSchema, type Expense } from "./schema";

const membershipOperator = (
  negative: boolean,
  count: number,
  locale: ProseLocale = "en-US",
) => messages[locale][membershipOperatorKey(negative, count)];
const listSeparator = (
  index: number,
  count: number,
  negative: boolean,
  locale: ProseLocale = "en-US",
) => messages[locale][listSeparatorKey(index, count, negative)] ?? "";

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
  const rule = createProseRule();
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

test("neither / nor excludes every selected department", () => {
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
  expect(membershipOperator(false, 0)).toBe("is");
  expect(membershipOperator(true, 1)).toBe("is not");
  expect(membershipOperator(true, 2)).toBe("is neither");
  const sentence = (values: string[], negative: boolean) =>
    values
      .map((value, i) => listSeparator(i, values.length, negative) + value)
      .join("");
  expect(sentence([], false)).toBe("");
  expect(sentence(["Sales"], false)).toBe("Sales");
  expect(sentence(["Sales", "Marketing"], false)).toBe("Sales or Marketing");
  expect(sentence(["Sales", "Marketing", "Finance"], true)).toBe(
    "Sales, Marketing, nor Finance",
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
  expect(membershipOperator(true, 2, "zh-CN")).toBe("不属于以下任一项：");
  expect(membershipOperator(true, 2, "ja-JP")).toBe("のいずれでもない");
  expect(listSeparator(1, 2, false, "zh-CN")).toBe("或");
  expect(listSeparator(1, 2, true, "ja-JP")).toBe("、");
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
