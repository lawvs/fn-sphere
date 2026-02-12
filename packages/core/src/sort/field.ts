import { isSameType } from "zod-compare";
import type { $ZodTuple, $ZodType, $ZodTypes } from "zod/v4/core";
import { isGenericFilter } from "../fn-helpers.js";
import type { FilterPath } from "../filter/types.js";
import type { FnSchema, StandardFnSchema } from "../types.js";
import type { SortField } from "./types.js";
import { instantiateGenericSortFn } from "./utils.js";

const bfsSchemaField = (
  schema: $ZodType,
  maxDeep: number,
  walk: (field: $ZodType, path: FilterPath) => void,
) => {
  const queue = [
    {
      schema,
      path: [] as FilterPath,
      deep: 0,
    },
  ];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;
    if (current.deep > maxDeep) break;

    walk(current.schema, current.path);

    const currentSchema = current.schema as $ZodTypes;
    if (currentSchema._zod.def.type !== "object") continue;

    const fields = currentSchema._zod.def.shape;
    for (const key in fields) {
      const field = fields[key];
      if (!field) continue;
      queue.push({
        schema: field,
        path: [...current.path, key] as FilterPath,
        deep: current.deep + 1,
      });
    }
  }
};

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
        return instantiateGenericSortFn(fieldSchema, fnSchema);
      })
      .filter((fn): fn is StandardFnSchema => !!fn);

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
