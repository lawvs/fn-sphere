import type { ZodType } from "zod";
import type {
  FieldFilter,
  FilterGroup,
  FilterableField,
  FnSchema,
  GenericFnSchema,
  SerializedGroup,
  SerializedRule,
  StandardFnSchema,
} from "../types.js";
import { isFilterFn } from "../utils.js";
import { createFieldFilter, filterPredicate } from "./field.js";
import { findFilterField } from "./pure.js";
import { createFilterGroup, serializeFieldRule } from "./utils.js";

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

  const createFilterPredicate = <T extends DataType, R extends T>(
    rule: FieldFilter<R> | FilterGroup<R>,
    skipEmptyFilter = true,
  ): ((data: T) => boolean) => {
    return (data: DataType) =>
      filterPredicate(dataSchema, data, rule, skipEmptyFilter);
  };

  const filterData = <T extends DataType, R extends T>(
    data: T[],
    rule: FieldFilter<R> | FilterGroup<R>,
    skipEmptyFilter = true,
  ): T[] => {
    const predicate = createFilterPredicate(rule, skipEmptyFilter);
    return data.filter(predicate);
  };

  function deserializeFieldRule(data: SerializedRule): FieldFilter<DataType>;
  function deserializeFieldRule(data: SerializedGroup): FilterGroup<DataType>;
  function deserializeFieldRule(
    data: SerializedGroup | SerializedRule,
  ): FilterGroup<DataType> | FieldFilter<DataType> {
    if (data.type === "Filter") {
      const filter = state.filter[data.name] || state.genericFn[data.name];
      if (!filter) {
        console.error("Failed to deserialize filter rule!", data, state);
        throw new Error(
          `Failed to deserialize filter rule! Filter not found! ${data.name}`,
        );
      }
      const result = createFieldFilter<DataType>(
        filter,
        data.field,
        data.arguments,
      );
      return result;
    }
    if (data.type === "FilterGroup") {
      const conditions: (FilterGroup<DataType> | FieldFilter<DataType>)[] =
        data.conditions.map(deserializeFieldRule as any);
      return createFilterGroup(data.op, conditions);
    }
    throw new Error("Invalid rule" + data);
  }

  return {
    _state: state,
    dataSchema,

    findFilterableField,
    createFilterGroup,
    createFilterPredicate,
    filterData,

    serializeFieldRule,
    deserializeFieldRule,
  };
};
