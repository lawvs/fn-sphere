import {
  createFilterGroup,
  createSingleFilter,
  presetFilter,
  type SingleFilter,
} from "@fn-sphere/filter";
import { z } from "zod";

const literal = <T extends string>(value: T) =>
  z.literal(value).describe(`value.${value}`);

export const expenseSchema = z.object({
  seniority: z
    .union([literal("Contributor"), literal("Manager"), literal("Director")])
    .describe("field.seniority"),
  department: z
    .union([
      literal("Engineering"),
      literal("Sales"),
      literal("Marketing"),
      literal("Finance"),
      literal("Operations"),
    ])
    .describe("field.department"),
  expenseType: z
    .union([
      literal("Food & drink"),
      literal("Travel"),
      literal("Lodging"),
      literal("Software"),
      literal("Office supplies"),
      literal("Entertainment"),
    ])
    .describe("field.expenseType"),
  merchant: z.string().describe("field.merchant"),
  currency: z
    .union([literal("USD"), literal("EUR"), literal("GBP"), literal("SGD")])
    .describe("field.currency"),
  amount: z.number().describe("field.amount"),
});

export type Expense = z.infer<typeof expenseSchema>;
export const proseFilters = presetFilter.filter((filter) =>
  [
    "equals",
    "notEqual",
    "contains",
    "notContains",
    "greaterThan",
    "greaterThanOrEqual",
    "lessThan",
    "lessThanOrEqual",
  ].includes(filter.name),
);

export const amountRule = () =>
  createSingleFilter({ path: ["amount"], name: "greaterThan", args: [500] });

// Stable fixture IDs keep the initial server and client markup identical.
const fixtureRule = (
  id: string,
  input: Omit<SingleFilter, "id" | "type">,
): SingleFilter => ({
  ...input,
  id: id as SingleFilter["id"],
  type: "Filter",
});
export function createProseRule() {
  return {
    ...createFilterGroup({ op: "and" }),
    id: "prose-root" as SingleFilter["id"],
    conditions: [
      fixtureRule("prose-seniority", {
        path: ["seniority"],
        name: "equals",
        args: ["Manager"],
      }),
      {
        ...createFilterGroup({ op: "or" }),
        id: "prose-list" as SingleFilter["id"],
        conditions: [
          fixtureRule("prose-type", {
            path: ["expenseType"],
            name: "contains",
            args: [["Food & drink", "Travel"]],
          }),
          fixtureRule("prose-merchant", {
            path: ["merchant"],
            name: "equals",
            args: ["Uber"],
          }),
          fixtureRule("prose-currency", {
            path: ["currency"],
            name: "equals",
            args: ["USD"],
          }),
        ],
      },
    ],
  };
}

export function allowedOperators(field: string | number | undefined) {
  if (field === "merchant") return ["equals", "notEqual"];
  if (field === "amount")
    return [
      "equals",
      "notEqual",
      "greaterThan",
      "greaterThanOrEqual",
      "lessThan",
      "lessThanOrEqual",
    ];
  return ["equals", "notEqual", "contains", "notContains"];
}
