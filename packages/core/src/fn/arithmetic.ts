import { z } from "zod";
import { defineTypedFn } from "../fn-helpers.js";
import type { StandardFnSchema } from "../types.js";

export const arithmeticFns: StandardFnSchema[] = [
  defineTypedFn({
    name: "add",
    define: z.function({
      input: [z.number(), z.number()],
      output: z.number(),
    }),
    implement: (a, b) => a + b,
  }),
  defineTypedFn({
    name: "subtract",
    define: z.function({
      input: [z.number(), z.number()],
      output: z.number(),
    }),
    implement: (a, b) => a - b,
  }),
  defineTypedFn({
    name: "multiply",
    define: z.function({
      input: [z.number(), z.number()],
      output: z.number(),
    }),
    implement: (a, b) => a * b,
  }),
  defineTypedFn({
    name: "divide",
    define: z.function({
      input: [z.number(), z.number()],
      output: z.number(),
    }),
    implement: (a, b) => {
      if (b === 0) {
        throw new RangeError("Division by zero");
      }
      return a / b;
    },
  }),
];
