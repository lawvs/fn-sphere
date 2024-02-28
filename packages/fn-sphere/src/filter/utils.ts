import { z } from "zod";
import type { FieldFilter, FilterGroup, FnSchema } from "../types.js";

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

export const isFilterFn = (fn: FnSchema) => {
  if (!(fn.define.returnType() instanceof z.ZodBoolean)) {
    console.error("Filter should return boolean!", fn);
    return false;
  }
  const parameters = fn.define.parameters();
  if (parameters.items.length === 0) {
    console.error("Filter should have at least one parameter!", fn);
    return false;
  }
  return true;
};

export const serializeFieldFilter = <T>(
  rule: FieldFilter<T> | FilterGroup<T>,
) => {
  // TODO support group
  // TODO check cannot serialized arguments
  // TODO types
  if (rule.filterType === "FilterGroup") {
    throw new Error("Not implemented yet!");
  }
  return JSON.stringify({
    type: "Filter",
    name: rule.schema.name,
    field: rule.field,
    arguments: rule.getPlaceholderArguments(),
  });
};
