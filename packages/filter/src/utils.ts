import { type FilterField, type StandardFnSchema } from "@fn-sphere/core";
import z from "zod";

export const emptyArray: never[] = [];
export const noop = () => {};

export const defaultMapFieldName: (field: FilterField) => string = (field) => {
  if (
    z.globalRegistry.has(field.fieldSchema) &&
    z.globalRegistry.get(field.fieldSchema)!.description
  ) {
    return z.globalRegistry.get(field.fieldSchema)!.description!;
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
