import type { ZodType } from "zod";
import { z } from "zod";
import { isSameType } from "zod-compare";
import type { FnSchema, StandardFnSchema } from "../types.js";
import { isGenericFilter } from "../utils.js";
import { createFieldFilter } from "./field.js";
import type { FilterableField } from "./types.js";
import { instantiateGenericFilter } from "./utils.js";

const bfsSchemaField = (
  schema: z.ZodType,
  maxDeep: number,
  walk: (field: z.ZodSchema, path: string[]) => void,
) => {
  const queue = [
    {
      schema,
      path: [] as string[],
      deep: 0,
    },
  ];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;
    if (current.deep > maxDeep) {
      break;
    }
    walk(current.schema, current.path);

    if (!(current.schema instanceof z.ZodObject)) {
      continue;
    }
    const fields = current.schema.shape;
    for (const key in fields) {
      const field = fields[key];
      queue.push({
        schema: field,
        path: [...current.path, key],
        deep: current.deep + 1,
      });
    }
  }
};

export const findFilterField = <DataType>({
  schema,
  filterList,
  maxDeep = 1,
}: {
  schema: ZodType<DataType>;
  filterList: FnSchema[];
  maxDeep?: number;
}): FilterableField<DataType>[] => {
  const result: FilterableField<DataType>[] = [];

  const walk = (fieldSchema: ZodType, path: string[]) => {
    const instantiationFilter: StandardFnSchema[] = filterList
      .map((fnSchema): StandardFnSchema | undefined => {
        if (!isGenericFilter(fnSchema)) {
          // Standard filter
          return fnSchema;
        }
        const genericFilter = fnSchema;
        return instantiateGenericFilter(fieldSchema, genericFilter);
      })
      .filter((fn): fn is StandardFnSchema => !!fn);

    const availableFilter = instantiationFilter.filter((filter) => {
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

  bfsSchemaField(schema, maxDeep, walk);
  return result;
};
