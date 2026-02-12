import type { $ZodType, $ZodTypes } from "zod/v4/core";
import { isCompareFn } from "../fn-helpers.js";
import type { GenericFnSchema, StandardFnSchema } from "../types.js";

export const instantiateGenericSortFn = (
  schema: $ZodType,
  genericFn: GenericFnSchema,
): StandardFnSchema | undefined => {
  if (!genericFn.genericLimit(schema as $ZodTypes)) {
    return;
  }
  const instantiationFn: StandardFnSchema = {
    name: genericFn.name,
    define: genericFn.define(schema),
    implement: genericFn.implement,
    skipValidate: genericFn.skipValidate,
    meta: {
      ...genericFn.meta,
      datatype: schema,
      genericFn: genericFn,
    },
  };
  if (!isCompareFn(instantiationFn)) {
    return;
  }
  return instantiationFn;
};
