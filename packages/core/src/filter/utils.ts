import { ZodObject, type ZodType } from "zod";
import type { GenericFnSchema, StandardFnSchema } from "../types.js";
import { isFilterFn } from "../utils.js";
import type {
  FieldFilter,
  FilterGroup,
  FilterId,
  Path,
  SerializedGroup,
  SerializedRule,
} from "./types.js";

export const createFilterGroup = <T>(
  op: FilterGroup<T>["op"],
  rules: (FieldFilter<T> | FilterGroup<T>)[],
): FilterGroup<T> => {
  const state = {
    invert: false,
  };
  return {
    _state: state,
    type: "FilterGroup",
    op,
    conditions: rules,
    isInvert: () => state.invert,
    setInvert: (invert) => (state.invert = invert),
  };
};

export const instantiateGenericFilter = (
  schema: ZodType,
  genericFn: GenericFnSchema,
): StandardFnSchema | undefined => {
  if (!genericFn.genericLimit(schema)) {
    return;
  }
  const instantiationFn: StandardFnSchema = {
    name: genericFn.name,
    define: genericFn.define(schema),
    implement: genericFn.implement,
    skipValidate: genericFn.skipValidate,
  };
  // For debug
  (instantiationFn as any).__generic = schema;
  (instantiationFn as any).__genericFn = genericFn;
  const isFilter = isFilterFn(instantiationFn);
  if (!isFilter) {
    return;
  }
  return instantiationFn;
};

export const countNumberOfRules = (
  rule: FilterGroup | FieldFilter | SerializedGroup | SerializedRule,
): number => {
  if (rule.type === "Filter") {
    return 1;
  }
  if (rule.type === "FilterGroup") {
    return rule.conditions.reduce((acc, r) => acc + countNumberOfRules(r), 0);
  }
  throw new Error("Invalid rule!");
};

export function genFilterId(): FilterId {
  return Math.random().toString(36).slice(2, 9) as FilterId;
}

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
export const getSchemaAtPath = <T extends ZodType = ZodType>(
  schema: ZodType,
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
    if (!(result instanceof ZodObject)) {
      return defaultValue as T;
    }
    result = result.shape[path[i]];
  }
  return result as T;
};
