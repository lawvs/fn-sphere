import {
  genFilterId,
  type LooseFilterGroup,
  type LooseFilterRule,
} from "@fn-sphere/core";
import type { BasicFilterProps, FlattenFilterGroup } from "./types.js";

export const createEmptyFilterRule = () =>
  ({
    id: genFilterId(),
    type: "Filter",
    arguments: [],
  }) satisfies LooseFilterRule;

export const createEmptyFilterGroup = (op: LooseFilterGroup["op"]) =>
  ({
    id: genFilterId(),
    type: "FilterGroup",
    op,
    conditions: [createEmptyFilterRule()],
  }) satisfies LooseFilterGroup;

export const isFlattenFilterGroup = (
  filterGroup: LooseFilterGroup,
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
  BasicFilterProps["mapFieldName"]
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
  BasicFilterProps["mapFilterName"]
> = (filterSchema) => {
  return filterSchema.name;
};
