import { z } from "zod";
import type { FnSchema } from "./types.js";
import { isSameType } from "zod-compare";

/**
 * Simple get function
 * See https://gist.github.com/jeneg/9767afdcca45601ea44930ea03e0febf
 *
 * @example
 * ```ts
 * const obj = {
 *  selector: { to: { val: "val" } },
 *  target: [1, 2, { a: "test" }],
 * };
 *
 * get(obj, "selector.to.val"); // "val"
 * get(obj, "target.2.a"); // "test"
 */
export const get = <T = unknown>(
  value: any,
  path: string,
  defaultValue?: T,
): T => {
  if (!path) {
    return value;
  }
  return String(path)
    .split(".")
    .filter(Boolean)
    .reduce((acc, v) => {
      try {
        acc = acc[v];
      } catch (e) {
        return defaultValue;
      }
      return acc;
    }, value);
};

export const isFilterFn = (fn: FnSchema) => {
  if (!(fn.define.returnType() instanceof z.ZodBoolean)) {
    // Filter should return boolean
    return false;
  }
  const parameters = fn.define.parameters();
  if (parameters.items.length === 0) {
    // Filter should have at least one parameter
    return false;
  }
  return true;
};

export const isCompareFn = (fn: FnSchema) => {
  const returnType = fn.define.returnType();
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
  if (
    !(
      returnType instanceof z.ZodNumber ||
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
  const parameters = fn.define.parameters();
  if (parameters.items.length !== 2) {
    // Compare should have exactly two parameters
    return false;
  }
  return true;
};
