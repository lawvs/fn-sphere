import { type FilterField, type StandardFnSchema } from "@fn-sphere/core";

export const noop = () => {};

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

export const defaultGetLocaleText = (key: string) => key;
