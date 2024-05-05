import { ZodAny, ZodObject, z, type ZodType } from "zod";
import type { GenericFnSchema, StandardFnSchema } from "../types.js";
import { isFilterFn, unreachable } from "../utils.js";
import type {
  FilterId,
  FilterPath,
  LooseFilterGroup,
  LooseFilterRule,
} from "./types.js";

export const instantiateGenericFn = (
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

export const getFirstParameters = (fnSchema: StandardFnSchema) => {
  const fullParameters = fnSchema.define.parameters();
  if (!fullParameters.items.length) {
    console.error(
      "Invalid filter parameters!",
      fnSchema,
      fnSchema.define.parameters(),
    );
    throw new Error("Invalid filter parameters!");
  }

  return fullParameters.items.at(0) as ZodAny;
};

// **Parameter** is the variable in the declaration of the function.
// **Argument** is the actual value of this variable that gets passed to the function.
export const getRequiredParameters = (fnSchema: StandardFnSchema) => {
  const fullParameters = fnSchema.define.parameters();
  if (!fullParameters.items.length) {
    console.error(
      "Invalid filter parameters!",
      fnSchema,
      fnSchema.define.parameters(),
    );
    throw new Error("Invalid filter parameters!");
  }
  // https://github.com/colinhacks/zod/blob/a5a9d31018f9c27000461529c582c50ade2d3937/src/types.ts#L3268
  const rest = fullParameters._def.rest;
  // TODO fix should not return empty tuple
  const stillNeed = z.tuple(fullParameters.items.slice(1));
  if (!rest) {
    return stillNeed;
  }
  return stillNeed.rest(rest);
};

export const countNumberOfRules = (
  rule: LooseFilterGroup | LooseFilterRule,
): number => {
  if (rule.type === "Filter") {
    return 1;
  }
  if (rule.type === "FilterGroup") {
    return rule.conditions.reduce((acc, r) => acc + countNumberOfRules(r), 0);
  }
  unreachable(rule);
};

export function genFilterId(): FilterId {
  return Math.random().toString(36).slice(2, 9) as FilterId;
}

export const isEqualPath = (a: FilterPath, b: FilterPath): boolean => {
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
export const getValueAtPath = <R = unknown>(data: any, path: FilterPath): R => {
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
  path: FilterPath,
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
