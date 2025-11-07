import { z } from "zod";
import type {
  $ZodArray,
  $ZodBoolean,
  $ZodEnum,
  $ZodLiteral,
  $ZodNullable,
  $ZodNumber,
  $ZodOptional,
  $ZodString,
  $ZodUnion,
} from "zod/v4/core";
import { defineGenericFn, defineTypedFn } from "./fn-sphere.js";
import type { GenericFnSchema, StandardFnSchema } from "./types.js";

export const stringFilter = [
  defineTypedFn({
    name: "startsWith",
    define: z.function({
      input: [z.string(), z.coerce.string()],
      output: z.boolean(),
    }),
    implement: (value, target) => {
      if (!target) return true;
      if (typeof value !== "string") return false;
      return value.toLowerCase().startsWith(target.toLowerCase());
    },
  }),
  defineTypedFn({
    name: "endsWith",
    define: z.function({
      input: [z.string(), z.coerce.string()],
      output: z.boolean(),
    }),
    implement: (value, target) => {
      if (!target) return true;
      if (typeof value !== "string") return false;
      return value.toLowerCase().endsWith(target.toLowerCase());
    },
  }),
];

export const numberFilter = [
  defineTypedFn({
    name: "greaterThan",
    define: z.function({
      input: [z.number(), z.coerce.number()],
      output: z.boolean(),
    }),
    implement: (value, target) => {
      return value > target;
    },
  }),
  defineTypedFn({
    name: "greaterThanOrEqual",
    define: z.function({
      input: [z.number(), z.coerce.number()],
      output: z.boolean(),
    }),
    implement: (value, target) => {
      return value >= target;
    },
  }),
  defineTypedFn({
    name: "lessThan",
    define: z.function({
      input: [z.number(), z.coerce.number()],
      output: z.boolean(),
    }),
    implement: (value, target) => {
      return value < target;
    },
  }),
  defineTypedFn({
    name: "lessThanOrEqual",
    define: z.function({
      input: [z.number(), z.coerce.number()],
      output: z.boolean(),
    }),
    implement: (value, target) => {
      return value <= target;
    },
  }),
];

export const dateFilter = [
  defineTypedFn({
    name: "before",
    define: z.function({
      input: [z.date(), z.coerce.date()],
      output: z.boolean(),
    }),
    implement: (value, target) => {
      return value.getTime() < target.getTime();
    },
  }),
  defineTypedFn({
    name: "after",
    define: z.function({
      input: [z.date(), z.coerce.date()],
      output: z.boolean(),
    }),
    implement: (value, target) => {
      return value.getTime() > target.getTime();
    },
  }),
];

// TODO support optional field
export const commonFilters: StandardFnSchema[] = [
  ...stringFilter,
  ...numberFilter,
  ...dateFilter,
];

const genericEqualFilter = [
  defineGenericFn({
    name: "equals",
    genericLimit: (
      t,
    ): t is
      | $ZodBoolean
      | $ZodString
      | $ZodNumber
      | $ZodEnum
      | $ZodUnion<$ZodLiteral[]> =>
      t._zod.def.type === "boolean" ||
      t._zod.def.type === "string" ||
      t._zod.def.type === "number" ||
      t._zod.def.type === "enum" ||
      (t._zod.def.type === "union" &&
        t._zod.def.options.every((op) => op._zod.def.type === "literal")),
    define: (t) =>
      z.function({
        input: [t, t],
        output: z.boolean(),
      }),
    implement: (value: unknown, target: unknown) => {
      if (typeof value === "string" && typeof target === "string") {
        return value.toLowerCase() === target.toLowerCase();
      }
      return value === target;
    },
  }),
  defineGenericFn({
    name: "notEqual",
    genericLimit: (
      t,
    ): t /* | $ZodBoolean */ is
      | $ZodString
      | $ZodNumber
      | $ZodEnum
      | $ZodUnion<$ZodLiteral[]> =>
      // not equal for boolean is not useful
      // t._zod.def.type === "boolean"  ||
      t._zod.def.type === "string" ||
      t._zod.def.type === "number" ||
      t._zod.def.type === "enum" ||
      (t._zod.def.type === "union" &&
        t._zod.def.options.every((op) => op._zod.def.type === "literal")),
    define: (t) =>
      z.function({
        input: [t, t],
        output: z.boolean(),
      }),
    implement: (value: unknown, target: unknown) => {
      if (typeof value === "string" && typeof target === "string") {
        return value.toLowerCase() !== target.toLowerCase();
      }
      return value !== target;
    },
  }),
];

const genericEmptyFilter = [
  defineGenericFn({
    name: "isEmpty",
    genericLimit: (t): t is $ZodOptional | $ZodNullable | $ZodString =>
      t._zod.def.type === "optional" ||
      t._zod.def.type === "nullable" ||
      t._zod.def.type === "string",
    define: (t) =>
      z.function({
        input: [t],
        output: z.boolean(),
      }),
    implement: (value: unknown | null | undefined | string) => {
      return value === null || value === undefined || value === "";
    },
  }),
  defineGenericFn({
    name: "isNotEmpty",
    genericLimit: (t): t is $ZodOptional | $ZodNullable | $ZodString =>
      t._zod.def.type === "optional" ||
      t._zod.def.type === "nullable" ||
      t._zod.def.type === "string",
    define: (t) =>
      z.function({
        input: [t],
        output: z.boolean(),
      }),
    implement: (value: unknown | null | undefined | string) => {
      return !(value === null || value === undefined || value === "");
    },
  }),
];

const genericContainFilter = [
  defineGenericFn({
    name: "contains",
    genericLimit: (
      t,
    ): t is $ZodString | $ZodArray | $ZodEnum | $ZodUnion<$ZodLiteral[]> =>
      t._zod.def.type === "string" ||
      t._zod.def.type === "array" ||
      t._zod.def.type === "enum" ||
      (t._zod.def.type === "union" &&
        t._zod.def.options.every((op) => op._zod.def.type === "literal")),
    define: (t) => {
      if (t._zod.def.type === "string") {
        return z.function({ input: [t, t], output: z.boolean() });
      }
      if (t._zod.def.type === "array") {
        const element = t._zod.def.element;
        return z.function({ input: [t, element], output: z.boolean() });
      }
      // union of literals or enum
      return z.function({ input: [t, z.array(t)], output: z.boolean() });
    },
    implement: (
      value: z.infer<
        $ZodString | $ZodArray | $ZodEnum | $ZodUnion<$ZodLiteral[]>
      >,
      target: string | unknown | unknown[],
    ) => {
      if (typeof value === "string" && typeof target === "string") {
        // $ZodString
        return value.toLowerCase().includes(target.toLowerCase());
      }
      if (Array.isArray(value)) {
        // $ZodArray
        return value.includes(target);
      }
      if (typeof value === "string" && Array.isArray(target)) {
        // $ZodUnion<$ZodLiteral[]> or $ZodEnum
        return target.includes(value);
      }
      console.error("Invalid input type!");
      return false;
    },
  }),
  defineGenericFn({
    name: "notContains",
    genericLimit: (
      t,
    ): t is $ZodString | $ZodArray | $ZodEnum | $ZodUnion<$ZodLiteral[]> =>
      t._zod.def.type === "array" ||
      t._zod.def.type === "string" ||
      t._zod.def.type === "enum" ||
      (t._zod.def.type === "union" &&
        t._zod.def.options.every((op) => op._zod.def.type === "literal")),
    define: (t) => {
      if (t._zod.def.type === "string") {
        return z.function({ input: [t, t], output: z.boolean() });
      }
      if (t._zod.def.type === "array") {
        const element = t._zod.def.element;
        return z.function({ input: [t, element], output: z.boolean() });
      }
      // union of literals or enum
      return z.function({ input: [t, z.array(t)], output: z.boolean() });
    },
    implement: (
      value: string | unknown[],
      target: string | unknown | unknown[],
    ) => {
      if (typeof value === "string" && typeof target === "string") {
        return !value.toLowerCase().includes(target.toLowerCase());
      }
      if (Array.isArray(value)) {
        return !value.includes(target);
      }
      if (typeof value === "string" && Array.isArray(target)) {
        return !target.includes(value);
      }
      console.error("Invalid input type!");
      return false;
    },
  }),
];

export const genericFilter: GenericFnSchema[] = [
  ...genericEqualFilter,
  ...genericEmptyFilter,
  ...genericContainFilter,
];

export const presetFilter = [...genericFilter, ...commonFilters];
