import type { ZodType } from "zod";
import type {
  FieldFilter,
  FilterGroup,
  FilterableField,
  FnSchema,
  GenericFnSchema,
  StandardFnSchema,
} from "../types.js";
import { isFilterFn } from "../utils.js";
import { createFilterPredicate } from "./create-filter-predicate.js";
import { findFilterField } from "./pure.js";
import { createFilterGroup } from "./utils.js";

export const createFilterSphere = <DataType>(
  dataSchema: ZodType<DataType>,
  filterFnList: FnSchema[],
) => {
  type FilterState = {
    schema: ZodType<DataType>;
    filter: Record<string, StandardFnSchema>;
    genericFn: Record<string, GenericFnSchema>;
  };
  const state: FilterState = {
    schema: dataSchema,
    filter: {},
    genericFn: {},
  };

  filterFnList.forEach((fn) => {
    if (fn.name in state.filter || fn.name in state.genericFn) {
      throw new Error("Duplicate filter name: " + fn.name);
    }
    const isGeneric = "genericLimit" in fn;
    if (isGeneric) {
      state.genericFn[fn.name] = fn;
      return;
    }
    if (!isFilterFn(fn)) {
      throw new Error("Invalid filter function: " + fn.name);
    }
    state.filter[fn.name] = fn;
  });

  const findFilterableField = ({
    maxDeep = 1,
  }: {
    maxDeep?: number;
  } = {}): FilterableField<DataType>[] =>
    findFilterField({
      schema: dataSchema,
      filterList: filterFnList,
      maxDeep,
    });

  const getFilterPredicate = <T extends DataType, R extends T>(
    rule: FieldFilter<R> | FilterGroup<R>,
    skipEmptyRule = true,
  ): ((data: T) => boolean) => {
    return createFilterPredicate({
      schema: dataSchema,
      rule,
      skipEmptyRule,
    });
  };

  const filterData = <T extends DataType, R extends T>(
    data: T[],
    rule: FieldFilter<R> | FilterGroup<R>,
    skipEmptyRule = true,
  ): T[] => {
    const predicate = getFilterPredicate(rule, skipEmptyRule);
    return data.filter(predicate);
  };

  return {
    _state: state,
    dataSchema,

    findFilterableField,
    createFilterGroup,
    getFilterPredicate,
    filterData,
  };
};
