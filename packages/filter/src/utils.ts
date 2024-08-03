import {
  genFilterId,
  type FilterField,
  type FilterGroup,
  type FilterGroupInput,
  type SingleFilter,
  type SingleFilterInput,
  type StandardFnSchema,
} from "@fn-sphere/core";

export const noop = () => {};

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

export const defaultMapFieldName: (field: FilterField) => string = (field) => {
  if (field.fieldSchema.description) {
    return field.fieldSchema.description;
  }
  if (field.path.length) {
    return field.path.join(".");
  }
  return "root";
};

export const defaultMapFilterName: (
  filterSchema: StandardFnSchema,
  field: FilterField,
) => string = (filterSchema) => {
  return filterSchema.name;
};
