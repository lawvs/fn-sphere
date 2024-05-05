import type { ZodType } from "zod";
import type { FnSchema } from "../types.js";
import { createFilterPredicate } from "./predicate.js";
import { findFilterField } from "./pure.js";
import type { LooseFilterGroup, LooseFilterRule } from "./types.js";

export const createFilterSphere = <Data = unknown>(
  dataSchema: ZodType<Data>,
  filterFnList: FnSchema[],
) => {
  const findFilterableField = ({
    maxDeep = 1,
  }: {
    maxDeep?: number;
  } = {}) =>
    findFilterField({
      schema: dataSchema,
      filterList: filterFnList,
      maxDeep,
    });

  const getFilterPredicate = (
    rule: LooseFilterRule | LooseFilterGroup,
  ): ((data: Data) => boolean) => {
    return createFilterPredicate({
      schema: dataSchema,
      filterList: filterFnList,
      rule,
    });
  };

  const filterData = (
    data: Data[],
    rule: LooseFilterRule | LooseFilterGroup,
  ): Data[] => {
    const predicate = getFilterPredicate(rule);
    return data.filter(predicate);
  };

  return {
    findFilterableField,
    getFilterPredicate,
    filterData,
  };
};
