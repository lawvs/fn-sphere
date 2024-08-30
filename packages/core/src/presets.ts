import { z } from "zod";
import { defineGenericFn, defineTypedFn } from "./fn-sphere.js";
import type { GenericFnSchema, StandardFnSchema } from "./types.js";

export const stringFilter = defineTypedFn([
  {
    name: "startsWith",
    define: z
      .function()
      .args(z.string(), z.coerce.string())
      .returns(z.boolean()),
    implement: (value, target) => {
      if (!target) return true;
      if (typeof value !== "string") return false;
      return value.toLowerCase().startsWith(target.toLowerCase());
    },
  },
  {
    name: "endsWith",
    define: z
      .function()
      .args(z.string(), z.coerce.string())
      .returns(z.boolean()),
    implement: (value, target) => {
      if (!target) return true;
      if (typeof value !== "string") return false;
      return value.toLowerCase().endsWith(target.toLowerCase());
    },
  },
]);

export const numberFilter = defineTypedFn([
  {
    name: "greaterThan",
    define: z
      .function()
      .args(z.number(), z.coerce.number())
      .returns(z.boolean()),
    implement: (value, target) => {
      return value > target;
    },
  },
  {
    name: "greaterThanOrEqual",
    define: z
      .function()
      .args(z.number(), z.coerce.number())
      .returns(z.boolean()),
    implement: (value, target) => {
      return value >= target;
    },
  },
  {
    name: "lessThan",
    define: z
      .function()
      .args(z.number(), z.coerce.number())
      .returns(z.boolean()),
    implement: (value, target) => {
      return value < target;
    },
  },
  {
    name: "lessThanOrEqual",
    define: z
      .function()
      .args(z.number(), z.coerce.number())
      .returns(z.boolean()),
    implement: (value, target) => {
      return value <= target;
    },
  },
]);

export const dateFilter = defineTypedFn([
  {
    name: "before",
    define: z.function().args(z.date(), z.coerce.date()).returns(z.boolean()),
    implement: (value, target) => {
      return value.getTime() < target.getTime();
    },
  },
  {
    name: "after",
    define: z.function().args(z.date(), z.coerce.date()).returns(z.boolean()),
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
  ...dateFilter,
];

const genericEqualFilter = defineGenericFn([
  {
    name: "equals",
    genericLimit: (
      t,
    ): t is
      | z.ZodBoolean
      | z.ZodString
      | z.ZodNumber
      | z.ZodUnion<[z.ZodLiteral<z.Primitive>]> =>
      t instanceof z.ZodBoolean ||
      t instanceof z.ZodString ||
      t instanceof z.ZodNumber ||
      (t instanceof z.ZodUnion &&
        t.options.every((op: z.ZodType) => op instanceof z.ZodLiteral)),
    define: (t) => z.function().args(t, t).returns(z.boolean()),
    implement: (value: unknown, target: unknown) => {
      if (typeof value === "string" && typeof target === "string") {
        return value.toLowerCase() === target.toLowerCase();
      }
      return value === target;
    },
  },
  {
    name: "notEqual",
    genericLimit: (
      t,
    ): t is  // | z.ZodBoolean
      | z.ZodString
      | z.ZodNumber
      | z.ZodUnion<[z.ZodLiteral<z.Primitive>]> =>
      // not equal for boolean is not useful
      // t instanceof z.ZodBoolean ||
      t instanceof z.ZodString ||
      t instanceof z.ZodNumber ||
      (t instanceof z.ZodUnion &&
        t.options.every((op: z.ZodType) => op instanceof z.ZodLiteral)),
    define: (t) => z.function().args(t, t).returns(z.boolean()),
    implement: (value: unknown, target: unknown) => {
      if (typeof value === "string" && typeof target === "string") {
        return value.toLowerCase() !== target.toLowerCase();
      }
      return value !== target;
    },
  },
]);

const genericBlankFilter = defineGenericFn([
  {
    name: "isEmpty",
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
  {
    name: "isNotEmpty",
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
      return !(value === null || value === undefined || value === "");
    },
  },
]);

const genericContainFilter = defineGenericFn([
  {
    name: "contains",
    genericLimit: (
      t,
    ): t is
      | z.ZodString
      | z.ZodArray<z.ZodType>
      | z.ZodUnion<[z.ZodLiteral<z.Primitive>]> =>
      t instanceof z.ZodString ||
      t instanceof z.ZodArray ||
      (t instanceof z.ZodUnion &&
        t.options.every((op: z.ZodType) => op instanceof z.ZodLiteral)),
    define: (t) => {
      if (t instanceof z.ZodString) {
        return z.function().args(t, t).returns(z.boolean());
      }
      if (t instanceof z.ZodArray) {
        return z.function().args(t, t.element).returns(z.boolean());
      }
      return z.function().args(t, z.array(t)).returns(z.boolean());
    },
    implement: (
      value: z.infer<
        | z.ZodString
        | z.ZodArray<z.ZodType>
        | z.ZodUnion<[z.ZodLiteral<z.Primitive>]>
      >,
      target: string | unknown | unknown[],
    ) => {
      if (typeof value === "string" && typeof target === "string") {
        // z.ZodString
        return value.toLowerCase().includes(target.toLowerCase());
      }
      if (Array.isArray(value)) {
        // z.ZodArray<z.ZodType>
        return value.includes(target);
      }
      if (typeof value === "string" && Array.isArray(target)) {
        // z.ZodUnion<[z.ZodLiteral<z.Primitive>]>
        return target.includes(value);
      }
      console.error("Invalid input type!");
      return false;
    },
  },
  {
    name: "notContains",
    genericLimit: (
      t,
    ): t is
      | z.ZodString
      | z.ZodArray<z.ZodType>
      | z.ZodUnion<[z.ZodLiteral<z.Primitive>]> =>
      t instanceof z.ZodArray ||
      t instanceof z.ZodString ||
      (t instanceof z.ZodUnion &&
        t.options.every((op: z.ZodType) => op instanceof z.ZodLiteral)),
    define: (t) => {
      if (t instanceof z.ZodString) {
        return z.function().args(t, t).returns(z.boolean());
      }
      if (t instanceof z.ZodArray) {
        return z.function().args(t, t.element).returns(z.boolean());
      }
      return z.function().args(t, z.array(t)).returns(z.boolean());
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
  },
]);

export const genericFilter: GenericFnSchema[] = [
  ...genericEqualFilter,
  ...genericBlankFilter,
  ...genericContainFilter,
];

export const presetFilter = [...genericFilter, ...commonFilters];
