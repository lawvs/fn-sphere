import { z } from "zod";
import { defineTypedFn } from "../fn-helpers.js";
import type { StandardFnSchema } from "../types.js";

export const logicFns: StandardFnSchema[] = [
  defineTypedFn({
    name: "and",
    define: z.function({
      input: [z.boolean(), z.boolean()],
      output: z.boolean(),
    }),
    implement: (a, b) => a && b,
  }),
  defineTypedFn({
    name: "or",
    define: z.function({
      input: [z.boolean(), z.boolean()],
      output: z.boolean(),
    }),
    implement: (a, b) => a || b,
  }),
  defineTypedFn({
    name: "not",
    define: z.function({
      input: [z.boolean()],
      output: z.boolean(),
    }),
    implement: (value) => !value,
  }),
];
