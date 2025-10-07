import { z } from "zod";
import type { $ZodType } from "zod/v4/core";
import type { FnSchema, StandardFnSchema } from "../types.js";
import { findFilterableFields } from "./field.js";
import { createFilterPredicate } from "./predicate.js";
import type {
  FilterField,
  FilterRule,
  SingleFilter,
  SingleFilterInput,
} from "./types.js";
import { createSingleFilter, getParametersExceptFirst } from "./utils.js";

export const createFilterSphere = <Data = unknown>(
  dataSchema: $ZodType<Data>,
  filterFnList: FnSchema[],
) => {
  const findFilterableField = ({
    maxDeep = 1,
  }: {
    maxDeep?: number;
  } = {}) =>
    findFilterableFields({
      schema: dataSchema,
      filterFnList,
      maxDeep,
    });

  const getFilterRule = (
    filterField: FilterField,
    fnSchema: StandardFnSchema,
    input: unknown[] = [],
    options?: Omit<SingleFilterInput, "name" | "path" | "args">,
  ): SingleFilter => {
    if (filterField.filterFnList.find((fn) => fn === fnSchema) === undefined) {
      throw new Error("Filter function is not allowed.");
    }
    const requiredParameters = getParametersExceptFirst(fnSchema);
    if (!fnSchema.skipValidate) {
      z.parse(requiredParameters, input);
    }

    return createSingleFilter({
      path: filterField.path,
      name: fnSchema.name,
      args: input,
      ...options,
    });
  };

  const getFilterPredicate = (rule: FilterRule): ((data: Data) => boolean) => {
    return createFilterPredicate({
      schema: dataSchema,
      filterFnList,
      filterRule: rule,
    });
  };

  const filterData = (data: Data[], rule: FilterRule): Data[] => {
    const predicate = getFilterPredicate(rule);
    return data.filter(predicate);
  };

  return {
    findFilterableField,
    getFilterPredicate,
    getFilterRule,
    filterData,
  };
};
