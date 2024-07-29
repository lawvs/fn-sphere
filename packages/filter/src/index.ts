export { FilterBuilder } from "./filter-builder.js";
export { FlattenFilterBuilder } from "./flatten-filter-builder.js";
export { useFilterGroup } from "./hooks/use-filter-group.js";
export { useFilterRule } from "./hooks/use-filter-rule.js";
export * from "./specs/index.js";
export type { BasicFilterBuilderProps } from "./types.js";
export {
  createEmptyFilterGroup,
  createEmptyFilterRule,
  defaultMapFieldName,
  defaultMapFilterName,
} from "./utils.js";

export {
  booleanFilter,
  commonFilters,
  dateFilter,
  genericFilter,
  numberFilter,
  presetFilter,
  stringFilter,
} from "@fn-sphere/core";
export type { FilterGroup, FilterRule, SingleFilter } from "@fn-sphere/core";
