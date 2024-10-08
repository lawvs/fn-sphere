import { z, type ZodType, type ZodTypeAny } from "zod";
import { isSameType } from "zod-compare";
import type { FnSchema, GenericFnSchema, StandardFnSchema } from "../types.js";
import { isFilterFn, unreachable } from "../utils.js";
import type {
  FilterField,
  FilterGroup,
  FilterGroupInput,
  FilterId,
  FilterPath,
  FilterRule,
  SingleFilter,
  SingleFilterInput,
} from "./types.js";
import { normalizeFilter } from "./validation.js";

export const and =
  <T extends (...args: any[]) => boolean>(...fnArray: NoInfer<T>[]) =>
  (...args: Parameters<T>) =>
    fnArray.every((fn) => fn(...args));

export const or =
  <T extends (...args: any[]) => boolean>(...fnArray: NoInfer<T>[]) =>
  (...args: Parameters<T>) =>
    fnArray.some((fn) => fn(...args));

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
    meta: {
      ...genericFn.meta,
      datatype: schema,
      genericFn: genericFn,
    },
  };
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

  return fullParameters.items.at(0) as z.ZodTypeAny;
};

/**
 * Returns all parameters from a function schema except the first.
 *
 * If the function schema has no parameters, it will throw an error.
 *
 * Glossary
 *
 * **Parameter** is the variable in the declaration of the function.
 * **Argument** is the actual value of this variable that gets passed to the function.
 */
export const getParametersExceptFirst = (
  fnSchema: StandardFnSchema,
): [] | [z.ZodTypeAny, ...z.ZodTypeAny[]] => {
  const fullParameters = fnSchema.define.parameters();
  if (!fullParameters.items.length) {
    console.error(
      "Invalid fnSchema parameters!",
      fnSchema,
      fnSchema.define.parameters(),
    );
    throw new Error("Invalid fnSchema parameters!");
  }

  const stillNeed = fullParameters.items.slice(1);
  // zod not support function rest parameter yet
  // See https://github.com/colinhacks/zod/issues/2859
  // https://github.com/colinhacks/zod/blob/a5a9d31018f9c27000461529c582c50ade2d3937/src/types.ts#L3268
  const rest = fullParameters._def.rest;
  // ZodFunction will always have a unknown rest parameter
  // See https://github.com/colinhacks/zod/blob/4641f434f3bb3dab1bb8cb07f44dd2693c72e35e/src/types.ts#L3991
  if (!isSameType(rest, z.unknown())) {
    console.warn(
      "Rest parameter is not supported yet, try to report this issue to developer.",
      fnSchema,
      fullParameters,
    );
  }
  return stillNeed;
};

export const countNumberOfRules = (rule: FilterRule): number => {
  if (rule.type === "Filter") {
    return 1;
  }
  if (rule.type === "FilterGroup") {
    return rule.conditions.reduce((acc, r) => acc + countNumberOfRules(r), 0);
  }
  unreachable(rule);
};

export const countValidRules = ({
  filterFnList,
  dataSchema,
  rule,
}: {
  filterFnList: FnSchema[];
  dataSchema: ZodTypeAny;
  rule: FilterRule;
}): number => {
  const strictRule = normalizeFilter({
    filterFnList,
    dataSchema,
    rule,
  });
  if (!strictRule) {
    return 0;
  }
  return countNumberOfRules(strictRule);
};

export function genFilterId(): FilterId {
  return Math.random().toString(36).slice(2, 9) as FilterId;
}

export const createSingleFilter = (
  ruleInput: SingleFilterInput = {
    args: [],
  },
) =>
  ({
    id: genFilterId(),
    type: "Filter",
    args: [],
    ...ruleInput,
  }) satisfies SingleFilter;

export const createFilterGroup = (ruleInput?: FilterGroupInput) =>
  ({
    id: genFilterId(),
    type: "FilterGroup",
    op: "and",
    conditions: [],
    ...ruleInput,
  }) satisfies FilterGroup;

/**
 * Creates a default rule based on the provided filterable fields.
 *
 * By default, it will auto-select the first field and the first filter.
 */
export const createDefaultRule = (
  filterableFields: FilterField[],
  { autoSelectFirstField = true, autoSelectFirstFilter = true } = {
    /**
     * If there is no filterable fields, it will return an empty rule.
     */
    autoSelectFirstField: true,
    autoSelectFirstFilter: true,
  },
): SingleFilter => {
  const firstField = filterableFields[0];
  if (!firstField) {
    console.error("No filterable fields", filterableFields);
    return createSingleFilter();
  }
  const newRule = createSingleFilter({
    path: autoSelectFirstField ? firstField.path : undefined,
    name: autoSelectFirstFilter ? firstField.filterFnList[0]?.name : undefined,
  });
  return newRule;
};

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
export const getValueAtPath = <R = unknown>(obj: any, path: FilterPath): R => {
  if (!path || path.length === 0) {
    return obj;
  }
  let result = obj;
  for (const key of path) {
    if (result == null) {
      return result;
    }
    result = result[key];
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
  for (const key of path) {
    if (result == null) {
      return defaultValue as T;
    }
    if (!(result instanceof z.ZodObject)) {
      return defaultValue as T;
    }
    result = result.shape[key];
  }
  return result as T;
};
