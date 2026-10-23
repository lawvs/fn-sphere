import { getLocaleConfig } from "./locales";
import { expect, test } from "vitest";
import {
  createFilterPredicate,
  presetFilter,
  createFilterGroup,
  createSingleFilter,
  type FilterGroup,
} from "@fn-sphere/filter";
import { createDefaultGroup, expenseSchema, type Expense } from "./schema";

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

test("locale dictionaries extend the built-in messages", () => {
  expect(getLocaleConfig("zh-CN").getLocaleText("addRule")).toBe(
    "\u6dfb\u52a0\u89c4\u5219",
  );
  expect(getLocaleConfig("ja-JP").getLocaleText("Manager")).toBe(
    "\u30de\u30cd\u30fc\u30b8\u30e3\u30fc",
  );
});
