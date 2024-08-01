import {
  genFilterId,
  type FilterGroup,
  type SingleFilter,
  type SingleFilterInput,
} from "@fn-sphere/core";
import type { BasicFilterBuilderProps, FlattenFilterGroup } from "./types.js";

export const createSingleFilter = (
  { name, path, args = [] }: SingleFilterInput = {
    args: [],
  },
) =>
  ({
    id: genFilterId(),
    type: "Filter",
    name,
    path,
    args,
  }) satisfies SingleFilter;

export const createEmptyFilterGroup = (
  op: FilterGroup["op"],
  includeRule = true,
) =>
  ({
    id: genFilterId(),
    type: "FilterGroup",
    op,
    conditions: includeRule ? [createSingleFilter()] : [],
  }) satisfies FilterGroup;

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

export const defaultMapFieldName: NonNullable<
  BasicFilterBuilderProps["mapFieldName"]
> = (field) => {
  if (field.fieldSchema.description) {
    return field.fieldSchema.description;
  }
  if (field.path.length) {
    return field.path.join(".");
  }
  return "root";
};

export const defaultMapFilterName: NonNullable<
  BasicFilterBuilderProps["mapFilterName"]
> = (filterSchema) => {
  return filterSchema.name;
};
