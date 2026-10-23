import {
  createFilterGroup,
  createSingleFilter,
  type SingleFilter,
  type FilterField,
  type StandardFnSchema,
} from "@fn-sphere/filter";
import { z } from "zod";
import type { $ZodTuple } from "zod/v4/core";

export const expenseSchema = z.object({
  seniority: z.union([
    z.literal("Contributor"),
    z.literal("Manager"),
    z.literal("Director"),
  ]),
  department: z.union([
    z.literal("Engineering"),
    z.literal("Sales"),
    z.literal("Marketing"),
    z.literal("Finance"),
    z.literal("Operations"),
  ]),
  expenseType: z.union([
    z.literal("Food & drink"),
    z.literal("Travel"),
    z.literal("Lodging"),
    z.literal("Software"),
    z.literal("Office supplies"),
    z.literal("Entertainment"),
  ]),
  merchant: z.string(),
  currency: z.union([
    z.literal("USD"),
    z.literal("EUR"),
    z.literal("GBP"),
    z.literal("SGD"),
  ]),
  amount: z.number(),
});

export type Expense = z.infer<typeof expenseSchema>;
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

export function mapExpenseFilterName(
  filter: StandardFnSchema,
  field: FilterField,
) {
  if (
    field.fieldSchema._zod.def.type === "number" &&
    filter.name === "equals"
  ) {
    return "numberEquals";
  }
  if (isMembershipFilter(filter)) {
    return `member.${filter.name}`;
  }
  return filter.name;
}

export function isMembershipFilter(filter: StandardFnSchema | undefined) {
  if (!filter || (filter.name !== "contains" && filter.name !== "notContains"))
    return false;
  const input = filter.define._zod.def.input as $ZodTuple;
  return input._zod.def.items[1]?._zod.def.type === "array";
}
