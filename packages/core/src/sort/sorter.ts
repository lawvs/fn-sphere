import type { $ZodType } from "zod/v4/core";
import { isCompareFn, isGenericFilter } from "../fn-helpers.js";
import {
  getSchemaAtPath,
  getValueAtPath,
  instantiateGenericFn,
} from "../filter/utils.js";
import type { FnSchema, GenericFnSchema, StandardFnSchema } from "../types.js";
import { findSortableFields } from "./field.js";
import type { SortField, SortItem, SortRule } from "./types.js";

export const createSorterSphere = <DataType>(
  dataSchema: $ZodType<DataType>,
  sortFnList: FnSchema[],
) => {
  type SortState = {
    schema: $ZodType<DataType>;
    sorter: Record<string, StandardFnSchema>;
    genericFn: Record<string, GenericFnSchema>;
  };
  const state: SortState = {
    schema: dataSchema,
    sorter: {},
    genericFn: {},
  };

  sortFnList.forEach((fn) => {
    if (fn.name in state.sorter || fn.name in state.genericFn) {
      throw new Error("Duplicate sorter name: " + fn.name);
    }
    const isGeneric = "genericLimit" in fn;
    if (isGeneric) {
      state.genericFn[fn.name] = fn;
      return;
    }
    if (!isCompareFn(fn)) {
      throw new Error("Invalid sorter function: " + fn.name);
    }
    state.sorter[fn.name] = fn;
  });

  const resolveSortFnSchema = (
    path: SortItem["path"],
    name: string,
  ): StandardFnSchema | undefined => {
    const fnSchema = sortFnList.find((f) => f.name === name);
    if (!fnSchema) return;
    if (!isGenericFilter(fnSchema)) {
      return fnSchema;
    }
    const targetSchema = getSchemaAtPath(dataSchema, path);
    if (!targetSchema) return;
    const instantiated = instantiateGenericFn(targetSchema, fnSchema);
    if (!instantiated || !isCompareFn(instantiated)) return;
    return instantiated;
  };

  const findSortableField = ({
    maxDeep = 1,
  }: {
    maxDeep?: number;
  } = {}) =>
    findSortableFields({
      schema: dataSchema,
      sortFnList,
      maxDeep,
    });

  const getSortRule = (
    sortField: SortField,
    fnSchema: StandardFnSchema,
    dir: "asc" | "desc" = "asc",
  ): SortItem => {
    if (sortField.sortFnList.find((fn) => fn === fnSchema) === undefined) {
      throw new Error("Sort function is not allowed.");
    }
    return {
      path: sortField.path,
      name: fnSchema.name,
      dir,
    };
  };

  const getSortComparator = (rule: SortRule): ((a: DataType, b: DataType) => number) => {
    if (rule.length === 0) {
      return () => 0;
    }

    // Pre-resolve all fns for performance
    const resolvedItems = rule.map((item) => {
      const fnSchema = resolveSortFnSchema(item.path, item.name);
      if (!fnSchema) {
        throw new Error(`Failed to resolve sort function: ${item.name}`);
      }
      const skipValidate = fnSchema.skipValidate;
      const fnWithImplement = skipValidate
        ? (fnSchema.implement as (a: unknown, b: unknown) => number)
        : (fnSchema.define.implement(fnSchema.implement) as (
            a: unknown,
            b: unknown,
          ) => number);
      return {
        ...item,
        fn: fnWithImplement,
      };
    });

    return (a: DataType, b: DataType): number => {
      for (const item of resolvedItems) {
        const valA = getValueAtPath(a, item.path);
        const valB = getValueAtPath(b, item.path);
        const result = item.fn(valA, valB);
        if (result !== 0) {
          return item.dir === "desc" ? -result : result;
        }
      }
      return 0;
    };
  };

  const sortData = (data: DataType[], rule: SortRule): DataType[] => {
    const comparator = getSortComparator(rule);
    return [...data].sort(comparator);
  };

  return {
    _state: state,
    dataSchema,
    findSortableField,
    getSortRule,
    getSortComparator,
    sortData,
  };
};
