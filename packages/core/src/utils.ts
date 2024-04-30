import { z } from "zod";
import { isSameType } from "zod-compare";
import type {
  FilterId,
  FnSchema,
  GenericFnSchema,
  Path,
  StandardFnSchema,
} from "./types.js";

export const isEqualPath = (a: Path, b: Path): boolean => {
  if (a.length !== b.length) {
    return false;
  }
  return a.every((v, i) => v === b[i]);
};

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
 * get(obj, ["selector", "to", "val"]); // "val"
 * get(obj, ["target", 2, "a"]); // "test"
 */
export const getValueAtPath = <T = unknown>(data: any, path: Path): T => {
  if (!path || path.length === 0) {
    return data;
  }
  let result = data;
  for (let i = 0; i < path.length; i++) {
    if (result == null) {
      return result;
    }
    result = result[path[i]];
  }
  return result;
};

/**
 * This function retrieves the schema from a given path within a Zod schema.
 */
export const getSchemaAtPath = <T extends z.ZodType = z.ZodType>(
  schema: z.ZodType,
  path: Path,
  defaultValue?: T,
): T | undefined => {
  if (!path || path.length === 0) {
    return schema as T;
  }
  let result = schema;
  for (let i = 0; i < path.length; i++) {
    if (result == null) {
      return defaultValue as T;
    }
    if (!(result instanceof z.ZodObject)) {
      return defaultValue as T;
    }
    result = result.shape[path[i]];
  }
  return result as T;
};

export function genFilterId(): FilterId {
  return Math.random().toString(36).slice(2, 9) as FilterId;
}

export const isGenericFilter = (
  fnSchema: FnSchema,
): fnSchema is GenericFnSchema => "genericLimit" in fnSchema;

export const isFilterFn = (fn: StandardFnSchema) => {
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

export const isCompareFn = (fn: StandardFnSchema) => {
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
