import {
  genFilterId,
  type FilterGroup,
  type FilterGroupInput,
  type SingleFilter,
  type SingleFilterInput,
} from "@fn-sphere/core";
import type { BasicFilterSphereProps, FlattenFilterGroup } from "./types.js";

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
 * @deprecated
 */
export const isFlattenFilterGroup = (
  filterGroup: FilterGroup,
): filterGroup is FlattenFilterGroup => {
  if (filterGroup.op === "and") {
    return false;
  }

  return filterGroup.conditions.every(
    (group) =>
      group.type === "FilterGroup" &&
      group.op === "and" &&
      group.conditions.every((rule) => rule.type === "Filter"),
  );
};

export const defaultMapFieldName: BasicFilterSphereProps["mapFieldName"] = (
  field,
) => {
  if (field.fieldSchema.description) {
    return field.fieldSchema.description;
  }
  if (field.path.length) {
    return field.path.join(".");
  }
  return "root";
};

export const defaultMapFilterName: BasicFilterSphereProps["mapFilterName"] = (
  filterSchema,
) => {
  return filterSchema.name;
};
