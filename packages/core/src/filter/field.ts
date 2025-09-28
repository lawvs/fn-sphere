import { isSameType } from "zod-compare";
import type { $ZodTuple, $ZodType, $ZodTypes } from "zod/v4/core";
import type { FnSchema, StandardFnSchema } from "../types.js";
import { isGenericFilter } from "../utils.js";
import type { FilterField, FilterPath } from "./types.js";
import { instantiateGenericFn } from "./utils.js";

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
      .filter((fn): fn is StandardFnSchema => !!fn);

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
