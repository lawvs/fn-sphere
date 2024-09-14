import { createFilterGroup, createSingleFilter } from "@fn-sphere/filter";
import { z } from "zod";

export const schema = z.object({
  id: z.number().describe("ID"),
  name: z.string().describe("Name"),
  createdAt: z.date().describe("Created At"),
  status: z
    .union([
      z.literal("pending"),
      z.literal("completed"),
      z.literal("cancelled"),
    ])
    .describe("Status"),
});

export const defaultRule = createFilterGroup({
  op: "and",
  conditions: [
    createSingleFilter(),
    createFilterGroup({
      op: "or",
      conditions: [createSingleFilter()],
    }),
  ],
});
