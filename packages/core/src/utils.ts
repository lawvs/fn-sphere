import { z } from "zod";
import { isSameType } from "zod-compare";
import type { $ZodTuple } from "zod/v4/core";
import type { FnSchema, GenericFnSchema, StandardFnSchema } from "./types.js";

export const isGenericFilter = (
  fnSchema: FnSchema,
): fnSchema is GenericFnSchema => "genericLimit" in fnSchema;

export const isFilterFn = (fn: StandardFnSchema) => {
  const returnType = fn.define._zod.def.output;
  if (!(returnType._zod.def.type === "boolean")) {
    // Filter should return boolean
    return false;
  }
  const parameters = fn.define._zod.def.input as $ZodTuple;
  if (parameters._zod.def.items.length === 0) {
    // Filter should have at least one parameter
    return false;
  }
  return true;
};

export const isCompareFn = (fn: StandardFnSchema) => {
  const returnType = fn.define._zod.def.output;
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
  if (
    !(
      returnType._zod.def.type === "number" ||
      isSameType(
        returnType,
        z.union([z.literal(-1), z.literal(0), z.literal(1)]),
      )
    )
  ) {
    // compareFn(a, b) return value	sort order
    // > 0	sort a after b, e.g. [b, a]
    // < 0	sort a before b, e.g. [a, b]
    // === 0	keep original order of a and b
    return false;
  }
  const parameters = fn.define._zod.def.input as $ZodTuple;
  if (parameters._zod.def.items.length !== 2) {
    // Compare should have exactly two parameters
    return false;
  }
  return true;
};

/**
 * This function should never be called. If it is called, it means that the
 * code has reached a point that should be unreachable.
 *
 * @example
 * ```ts
 * function f(val: 'a' | 'b') {
 *  if (val === 'a') {
 *   return 1;
 * } else if (val === 'b') {
 *  return 2;
 * }
 * unreachable(val);
 * ```
 */
export function unreachable(
  val: never,
  message = "Unreachable code reached",
): never {
  console.error(message, val);
  throw new Error(message);
}
