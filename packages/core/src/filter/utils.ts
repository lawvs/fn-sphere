import type { FieldFilter, FilterGroup } from "../types.js";

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

export const serializeFieldRule = <T>(
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
