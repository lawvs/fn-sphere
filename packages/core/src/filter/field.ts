import { isSameType } from "zod-compare";
import type { $ZodTuple, $ZodType } from "zod/v4/core";
import { isFilterFn, isGenericFilter } from "../fn-helpers.js";
import type { FnSchema, StandardFnSchema } from "../types.js";
import type { FilterField, FilterPath } from "./types.js";
import { bfsSchemaField, instantiateGenericFn } from "./utils.js";

/**
 * Find all fields that can be filtered based on the given schema and filterFnList.
 */
export const findFilterableFields = <Data>({
  schema,
  filterFnList,
  maxDeep = 1,
}: {
  schema: $ZodType<Data>;
  filterFnList: FnSchema[];
  maxDeep?: number;
}): FilterField[] => {
  const result: FilterField[] = [];

  const walk = (fieldSchema: $ZodType, path: FilterPath) => {
    const instantiationFilter: StandardFnSchema[] = filterFnList
      .map((fnSchema): StandardFnSchema | undefined => {
        if (!isGenericFilter(fnSchema)) {
          // Standard filter
          return fnSchema;
        }
        const genericFilter = fnSchema;
        return instantiateGenericFn(fieldSchema, genericFilter);
      })
      .filter((fn): fn is StandardFnSchema => !!fn)
      .filter(isFilterFn);

    const availableFilter = instantiationFilter.filter((filter) => {
      const { define } = filter;
      const parameters = define._zod.def.input as $ZodTuple;
      const firstFnParameter = parameters._zod.def.items[0];
      if (!firstFnParameter) {
        console.error("First function parameter is not defined", filter);
        return false;
      }
      // TODO use isCompatibleType
      if (
        firstFnParameter._zod.def.type === "any" ||
        isSameType(fieldSchema, firstFnParameter)
      ) {
        return true;
      }
    });

    if (availableFilter.length > 0) {
      result.push({
        path,
        fieldSchema,
        filterFnList: availableFilter,
      });
    }
  };

  bfsSchemaField(schema, maxDeep, walk);
  return result;
};
