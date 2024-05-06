import { z } from "zod";
import { defineGenericFn, defineTypedFn } from "./fn-sphere.js";
import type { GenericFnSchema, StandardFnSchema } from "./types.js";

export const stringFilter = defineTypedFn([
  // {
  //   define: z.function().args(z.string(), z.string()).returns(z.boolean()),
  //   name: "Is",
  //   implement: (value, target) => {
  //     if (!target) {
  //       return true;
  //     }
  //     return value == target;
  //   },
  // },
  // {
  //   define: z.function().args(z.string(), z.string()).returns(z.boolean()),
  //   name: "Is not",
  //   implement: (value, target) => {
  //     if (!target) {
  //       return true;
  //     }
  //     return value != target;
  //   },
  // },
  // {
  //   define: z.function().args(z.string(), z.string()).returns(z.boolean()),
  //   name: "Contains",
  //   implement: (value, target) => {
  //     if (!target) {
  //       return true;
  //     }
  //     return value.includes(target);
  //   },
  // },
  // {
  //   define: z.function().args(z.string(), z.string()).returns(z.boolean()),
  //   name: "Does not contains",
  //   implement: (value, target) => {
  //     if (!target) {
  //       return true;
  //     }
  //     return !value.includes(target);
  //   },
  // },
  {
    define: z
      .function()
      .args(z.string(), z.coerce.string())
      .returns(z.boolean()),
    name: "Starts with",
    implement: (value, target) => {
      if (!target) {
        return true;
      }
      return value.startsWith(target);
    },
  },
  {
    define: z
      .function()
      .args(z.string(), z.coerce.string())
      .returns(z.boolean()),
    name: "Ends with",
    implement: (value, target) => {
      if (!target) {
        return true;
      }
      return value.endsWith(target);
    },
  },
]);

export const numberFilter = defineTypedFn([
  {
    define: z
      .function()
      .args(z.number(), z.coerce.number())
      .returns(z.boolean()),
    name: ">",
    implement: (value, target) => {
      return value > target;
    },
  },
  {
    define: z
      .function()
      .args(z.number(), z.coerce.number())
      .returns(z.boolean()),
    name: ">=",
    implement: (value, target) => {
      return value >= target;
    },
  },
  {
    define: z
      .function()
      .args(z.number(), z.coerce.number())
      .returns(z.boolean()),
    name: "<",
    implement: (value, target) => {
      return value < target;
    },
  },
  {
    define: z
      .function()
      .args(z.number(), z.coerce.number())
      .returns(z.boolean()),
    name: "<=",
    implement: (value, target) => {
      return value <= target;
    },
  },
  // {
  //   define: z.function().args(z.number(), z.coerce.number()).returns(z.boolean()),
  //   name: "==",
  //   implement: (value, target) => {
  //     return value == target;
  //   },
  // },
  // {
  //   define: z.function().args(z.number(), z.coerce.number()).returns(z.boolean()),
  //   name: "!=",
  //   implement: (value, target) => {
  //     return value != target;
  //   },
  // },
]);

export const booleanFilter = defineTypedFn([
  {
    define: z.function().args(z.boolean()).returns(z.boolean()),
    name: "Is checked",
    implement: (value) => {
      return !!value;
    },
  },
  {
    define: z.function().args(z.boolean()).returns(z.boolean()),
    name: "Is unchecked",
    implement: (value) => {
      return !value;
    },
  },
]);

export const longWindedBooleanFilter = defineTypedFn([
  {
    define: z
      .function()
      .args(z.boolean(), z.coerce.boolean())
      .returns(z.boolean()),
    name: "Is equal",
    implement: (value, target) => {
      return value === target;
    },
  },
]);

export const dateFilter = defineTypedFn([
  {
    define: z.function().args(z.date(), z.coerce.date()).returns(z.boolean()),
    name: "Before",
    implement: (value, target) => {
      return value.getTime() < target.getTime();
    },
  },
  {
    define: z.function().args(z.date(), z.coerce.date()).returns(z.boolean()),
    name: "After",
    implement: (value, target) => {
      return value.getTime() > target.getTime();
    },
  },
]);

// TODO support case insensitive
// TODO support optional field
export const commonFilters: StandardFnSchema[] = [
  ...stringFilter,
  ...numberFilter,
  ...booleanFilter,
  ...dateFilter,
];

const genericEqualFilter = defineGenericFn([
  {
    name: "Equals",
    genericLimit: (
      t,
    ): t is z.ZodString | z.ZodNumber | z.ZodUnion<[z.ZodLiteral<any>]> =>
      t instanceof z.ZodString ||
      t instanceof z.ZodNumber ||
      (t instanceof z.ZodUnion &&
        t.options.every((op: z.ZodType) => op instanceof z.ZodLiteral)),
    define: (t) => z.function().args(t, t).returns(z.boolean()),
    implement: (value: z.Primitive, target: z.Primitive) => {
      return value === target;
    },
  },
  {
    name: "Not equal",
    genericLimit: (
      t,
    ): t is z.ZodString | z.ZodNumber | z.ZodUnion<[z.ZodLiteral<any>]> =>
      t instanceof z.ZodString ||
      t instanceof z.ZodNumber ||
      (t instanceof z.ZodUnion &&
        t.options.every((op: z.ZodType) => op instanceof z.ZodLiteral)),
    define: (t) => z.function().args(t, t).returns(z.boolean()),
    implement: (value: z.Primitive, target: z.Primitive) => {
      return value !== target;
    },
  },
]);

const genericBlankFilter = defineGenericFn([
  {
    name: "Is blank",
    genericLimit: (
      t,
    ): t is
      | z.ZodOptional<z.ZodTypeAny>
      | z.ZodNullable<z.ZodTypeAny>
      | z.ZodString =>
      t instanceof z.ZodOptional ||
      t instanceof z.ZodNullable ||
      t instanceof z.ZodString,
    define: (t) => z.function().args(t).returns(z.boolean()),
    implement: (value: unknown | null | undefined | string) => {
      return value === null || value === undefined || value === "";
    },
  },
]);

const genericContainFilter = defineGenericFn([
  {
    name: "Contains",
    genericLimit: (t): t is z.ZodArray<z.ZodType> | z.ZodString =>
      t instanceof z.ZodArray || t instanceof z.ZodString,
    define: (t) =>
      z
        .function()
        .args(t, t instanceof z.ZodString ? t : t.element)
        .returns(z.boolean()),
    implement: (value: string | unknown[], target: string | unknown) => {
      if (typeof value === "string" && typeof target === "string") {
        return value.includes(target);
      }
      if (Array.isArray(value)) {
        return value.includes(target);
      }
      throw new Error("Invalid input type!");
    },
  },
  {
    name: "Does not contains",
    genericLimit: (t): t is z.ZodArray<z.ZodType> | z.ZodString =>
      t instanceof z.ZodArray || t instanceof z.ZodString,
    define: (t) =>
      z
        .function()
        .args(t, t instanceof z.ZodString ? t : t.element)
        .returns(z.boolean()),
    implement: (value: string | unknown[], target: string | unknown) => {
      if (typeof value === "string" && typeof target === "string") {
        return !value.includes(target);
      }
      if (Array.isArray(value)) {
        return !value.includes(target);
      }
      throw new Error("Invalid input type!");
    },
  },
]);

export const genericFilter: GenericFnSchema[] = [
  ...genericEqualFilter,
  ...genericBlankFilter,
  ...genericContainFilter,
];
