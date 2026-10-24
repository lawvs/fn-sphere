import { createFilterGroup, createSingleFilter } from "@fn-sphere/filter";
import { z } from "zod";

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
export const createDefaultRule = () =>
  createSingleFilter({ path: ["amount"], name: "greaterThan", args: [500] });

export function createDefaultGroup() {
  return createFilterGroup({
    op: "and",
    conditions: [
      createSingleFilter({
        path: ["seniority"],
        name: "equals",
        args: ["Manager"],
      }),
      createFilterGroup({
        op: "or",
        conditions: [
          createSingleFilter({
            path: ["expenseType"],
            name: "contains",
            args: [["Food & drink", "Travel"]],
          }),
          createSingleFilter({
            path: ["merchant"],
            name: "equals",
            args: ["Uber"],
          }),
          createSingleFilter({
            path: ["currency"],
            name: "equals",
            args: ["USD"],
          }),
        ],
      }),
    ],
  });
}
