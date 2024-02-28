import type { ZodType } from "zod";
import { z } from "zod";
import { isSameType } from "zod-compare";
import type {
  FieldFilter,
  FilterableField,
  FilterGroup,
  FnSchema,
  GenericFnSchema,
} from "../types.js";
import {
  bfsSchemaField,
  createFieldFilter,
  createFilterGroup,
  filterPredicate,
  isFilterFn,
  serializeFieldFilter,
} from "./utils.js";

export const createFilterSphere = <DataType>(
  dataSchema: ZodType<DataType>,
  filterFnList: (FnSchema | GenericFnSchema)[],
) => {
  type FilterState = {
    schema: ZodType<DataType>;
    filter: Record<string, FnSchema>;
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

  const getField = ({
    maxDeep = 1,
  }: {
    maxDeep?: number;
  } = {}): FilterableField<DataType>[] => {
    const result: FilterableField<DataType>[] = [];
    const allSimpleFilter = Object.values(state.filter);
    const allGenericFilter = Object.values(state.genericFn);

    const walk = (fieldSchema: ZodType, path: string) => {
      const instantiationGenericFilter: FnSchema[] = allGenericFilter
        .map((filter): FnSchema | false => {
          const { genericLimit } = filter;
          if (!genericLimit(fieldSchema)) {
            return false;
          }
          const instantiationFn: FnSchema = {
            name: filter.name,
            define: filter.define(fieldSchema),
            implement: filter.implement,
          };
          const isFilter = isFilterFn(instantiationFn);
          if (!isFilter) {
            return false;
          }
          return instantiationFn;
        })
        .filter((fn): fn is FnSchema => !!fn);

      const availableFilter = [
        ...instantiationGenericFilter,
        ...allSimpleFilter,
      ].filter((filter) => {
        const { define } = filter;
        const parameters = define.parameters();
        const firstFnParameter: ZodType = parameters.items[0];
        // TODO use isCompatibleType
        if (
          firstFnParameter instanceof z.ZodAny ||
          isSameType(fieldSchema, firstFnParameter)
        ) {
          return true;
        }
      });

      if (availableFilter.length > 0) {
        result.push({
          path,
          fieldSchema,
          filterList: availableFilter.map((filter) =>
            createFieldFilter(filter, path),
          ),
        });
      }
    };

    bfsSchemaField(dataSchema, maxDeep, walk);
    return result;
  };

  const createFilterFn = (
    rule: FieldFilter<DataType> | FilterGroup<DataType>,
    skipEmptyFilter = true,
  ) => {
    return (data: DataType) =>
      filterPredicate(dataSchema, data, rule, skipEmptyFilter);
  };

  const filterData = <T extends DataType, R extends T>(
    data: T[],
    rule: FieldFilter<R> | FilterGroup<R>,
    skipEmptyFilter = true,
  ): T[] => {
    const predicate = createFilterFn(rule, skipEmptyFilter);
    return data.filter(predicate);
  };

  const deserializeFieldFilter = (data: string) => {
    // TODO types
    type serializedFilter = any;
    const parsed: serializedFilter = JSON.parse(data);
    if (parsed.type !== "Filter") {
      throw new Error("Invalid data!");
    }
    const filter = state.filter[parsed.name] || state.genericFn[parsed.name];
    if (!filter) {
      throw new Error("Filter not found!");
    }

    const result = createFieldFilter<DataType>(filter, parsed.field);
    result.input(...parsed.arguments);
    return result;
  };

  return {
    _state: state,
    dataSchema,

    getField,
    createFilterGroup,
    filterData,

    serializeFieldFilter,
    deserializeFieldFilter,
  };
};
