import type { ZodType } from "zod";
import type {
  FieldFilter,
  FilterGroup,
  GenericFnSchema,
  SerializedGroup,
  SerializedRule,
  StandardFnSchema,
} from "../types.js";
import { isFilterFn } from "../utils.js";

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
