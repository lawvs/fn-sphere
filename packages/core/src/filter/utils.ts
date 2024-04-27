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
    filterType: "FilterGroup",
    op,
    conditions: rules,
    isInvert: () => state.invert,
    setInvert: (invert) => (state.invert = invert),
  };
};

export function serializeFieldRule<T>(rule: FieldFilter<T>): SerializedRule;
export function serializeFieldRule<T>(rule: FilterGroup<T>): SerializedGroup;
export function serializeFieldRule<T>(
  rule: FilterGroup<T> | FieldFilter<T>,
): SerializedGroup | SerializedRule {
  if (rule.filterType === "Filter") {
    return {
      type: "Filter",
      name: rule.schema.name,
      field: rule.field,
      arguments: rule.getPlaceholderArguments(),
    };
  }

  if (rule.filterType === "FilterGroup") {
    return {
      type: "FilterGroup",
      op: rule.op,
      conditions: rule.conditions.map(serializeFieldRule as any),
    };
  }

  throw new Error("Invalid rule!");
}

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

export const countNumberOfRules = (rule: FilterGroup | FieldFilter): number => {
  if (rule.filterType === "Filter") {
    return 1;
  }
  if (rule.filterType === "FilterGroup") {
    return rule.conditions.reduce((acc, r) => acc + countNumberOfRules(r), 0);
  }
  throw new Error("Invalid rule!");
};
