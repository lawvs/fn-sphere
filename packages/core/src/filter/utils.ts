import type {
  FieldFilter,
  FilterGroup,
  SerializedGroup,
  SerializedRule,
} from "../types.js";

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
