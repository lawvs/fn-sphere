import { getProseLocaleText } from "./locale";
import { describe, expect, test } from "vitest";
import {
  createFilterPredicate,
  createFilterGroup,
  createSingleFilter,
  type FilterGroup,
} from "@fn-sphere/filter";
import {
  createDocument,
  createHistory,
  formatValue,
  historyReducer,
  listSeparator,
  membershipOperator,
  parseInput,
} from "./model";
import {
  createProseRule,
  expenseSchema,
  proseFilters,
  type Expense,
} from "./schema";

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
    filterFnList: proseFilters,
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

describe("document history", () => {
  test("undo and redo restore filters without mutating old snapshots", () => {
    const initial = createHistory();
    const document = createDocument();
    document.filterRule.op = "or";
    const changed = historyReducer(initial, { type: "commit", document });
    document.filterRule.conditions.length = 0;
    expect(changed.present.filterRule.conditions).toHaveLength(2);
    const undone = historyReducer(changed, { type: "undo" });
    expect(undone.present).toEqual(initial.present);
    expect(historyReducer(undone, { type: "redo" }).present).toEqual(
      changed.present,
    );
    expect(initial.present.filterRule.op).toBe("and");
  });
  test("a new edit clears redo; no-op commits leave history alone", () => {
    const initial = createHistory();
    expect(
      historyReducer(initial, { type: "commit", document: createDocument() }),
    ).toBe(initial);
    const changed = historyReducer(initial, {
      type: "commit",
      document: { filterRule: { ...initial.present.filterRule, op: "or" } },
    });
    const undone = historyReducer(changed, { type: "undo" });
    const edited = historyReducer(undone, {
      type: "commit",
      document: {
        ...undone.present,
        filterRule: { ...undone.present.filterRule, op: "or" },
      },
    });
    expect(edited.future).toHaveLength(0);
  });
  test("reset is undoable and history is bounded", () => {
    let state = createHistory();
    for (let index = 0; index < 120; index++) {
      state = historyReducer(state, {
        type: "commit",
        document: {
          ...state.present,
          filterRule: {
            ...state.present.filterRule,
            op: index % 2 ? "and" : "or",
          },
        },
      });
    }
    expect(state.past).toHaveLength(100);
    state = historyReducer(state, {
      type: "commit",
      document: { filterRule: { ...state.present.filterRule, op: "or" } },
    });
    const reset = historyReducer(state, { type: "reset" });
    expect(reset.present).toEqual(createDocument());
    expect(historyReducer(reset, { type: "undo" }).present).toEqual(
      state.present,
    );
  });
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

test("the locale bridge includes built-in messages and falls back to unknown keys", () => {
  expect(getProseLocaleText("zh-CN", "addRule")).toBe("添加规则");
  expect(getProseLocaleText("ja-JP", "value.Manager")).toBe("マネージャー");
  expect(getProseLocaleText("en-US", "unknown.key")).toBe("unknown.key");
  expect(getProseLocaleText("zh-CN", "toString")).toBe("toString");
});
