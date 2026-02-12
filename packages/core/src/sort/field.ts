import { isSameType } from "zod-compare";
import type { $ZodTuple, $ZodType } from "zod/v4/core";
import { isCompareFn, isGenericFilter } from "../fn-helpers.js";
import type { FilterPath } from "../filter/types.js";
import { bfsSchemaField, instantiateGenericFn } from "../filter/utils.js";
import type { FnSchema, StandardFnSchema } from "../types.js";
import type { SortField } from "./types.js";

/**
 * Find all fields that can be sorted based on the given schema and sortFnList.
 */
export const findSortableFields = <Data>({
  schema,
  sortFnList,
  maxDeep = 1,
}: {
  schema: $ZodType<Data>;
  sortFnList: FnSchema[];
  maxDeep?: number;
}): SortField[] => {
  const result: SortField[] = [];

  const walk = (fieldSchema: $ZodType, path: FilterPath) => {
    const instantiatedFns: StandardFnSchema[] = sortFnList
      .map((fnSchema): StandardFnSchema | undefined => {
        if (!isGenericFilter(fnSchema)) {
          return fnSchema;
        }
        return instantiateGenericFn(fieldSchema, fnSchema);
      })
      .filter((fn): fn is StandardFnSchema => !!fn)
      .filter(isCompareFn);

    const availableFns = instantiatedFns.filter((fn) => {
      const { define } = fn;
      const parameters = define._zod.def.input as $ZodTuple;
      const firstFnParameter = parameters._zod.def.items[0];
      if (!firstFnParameter) {
        console.error("First function parameter is not defined", fn);
        return false;
      }
      if (
        firstFnParameter._zod.def.type === "any" ||
        isSameType(fieldSchema, firstFnParameter)
      ) {
        return true;
      }
    });

    if (availableFns.length > 0) {
      result.push({
        path,
        fieldSchema,
        sortFnList: availableFns,
      });
    }
  };

  bfsSchemaField(schema, maxDeep, walk);
  return result;
};
