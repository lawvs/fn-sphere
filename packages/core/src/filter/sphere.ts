import type { ZodType } from "zod";
import type { FnSchema } from "../types.js";
import { findFilterableFields } from "./field.js";
import { createFilterPredicate } from "./predicate.js";
import type { FilterRule } from "./types.js";

export const createFilterSphere = <Data = unknown>(
  dataSchema: ZodType<Data>,
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
    filterData,
  };
};
