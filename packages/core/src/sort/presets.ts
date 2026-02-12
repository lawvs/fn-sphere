import { z } from "zod";
import type {
  $ZodBoolean,
  $ZodDate,
  $ZodEnum,
  $ZodNumber,
  $ZodString,
} from "zod/v4/core";
import { defineGenericFn } from "../fn-helpers.js";

const genericSort = defineGenericFn({
  name: "sort primitive",
  genericLimit: (
    t,
  ): t is $ZodBoolean | $ZodString | $ZodNumber | $ZodDate | $ZodEnum =>
    t._zod.def.type === "boolean" ||
    t._zod.def.type === "string" ||
    t._zod.def.type === "number" ||
    t._zod.def.type === "date" ||
    t._zod.def.type === "enum",
  define: (t) =>
    z.function({
      input: [t, t],
      output: z.number(),
    }),
  implement: (
    a: boolean | string | number | Date,
    b: boolean | string | number | Date,
  ) => {
    if (a === b) return 0;
    if (a < b) return -1;
    return 1;
  },
});

export const presetSort = [genericSort];
