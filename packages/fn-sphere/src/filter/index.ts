import { z } from "zod";
import type { ZodType } from "zod";
import type {
  InputFilter,
  ZodFilterFn,
  FieldFilter,
  FilterableField,
  FilterGroup,
} from "../types.js";
import { isSameType } from "zod-compare";
import { createFieldFilter, filterPredicate } from "./utils.js";

export const createFilterSphere = <DataType>(
  schema: ZodType<DataType>,
  filterFnList: InputFilter<ZodFilterFn>[],
) => {
  type FilterState = {
    schema: ZodType<DataType>;
    filter: Record<string, InputFilter<ZodFilterFn>>;
  };
  const state: FilterState = {
    schema,
    filter: {},
  };

  filterFnList.forEach((fn) => {
    if (fn.name in state.filter) {
      throw new Error("Duplicate filter name: " + fn.name);
    }
    if (!(fn.define.returnType() instanceof z.ZodBoolean)) {
      console.error("Filter should return boolean!", fn.name, fn.define);
      throw new Error("Invalid return type for filter: " + fn.name);
    }
    state.filter[fn.name] = fn;
  });

  const getField = ({
    maxDeep = 1,
  }: {
    maxDeep?: number;
  } = {}): FilterableField<DataType>[] => {
    const allFilter = Object.values(state.filter);
    const result: FilterableField<DataType>[] = [];

    const walk = (fieldSchema: ZodType, path: string) => {
      const availableFilter = allFilter.filter((filter) => {
        const { define } = filter;
        const parameters = define.parameters();
        const firstParameter: ZodType = parameters.items[0];
        // TODO use isCompatibleType
        if (
          firstParameter instanceof z.ZodAny ||
          isSameType(fieldSchema, firstParameter)
        ) {
          return true;
        }
      });
      // TODO limitFn
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

    const queue = [
      {
        schema,
        path: "",
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

      if (current.schema instanceof z.ZodObject) {
        const fields = current.schema.shape;
        for (const key in fields) {
          const field = fields[key];
          queue.push({
            schema: field,
            path: current.path ? current.path + "." + key : key,
            deep: current.deep + 1,
          });
        }
      }
    }
    return result;
  };

  const createFilterFn = (
    rule: FieldFilter<DataType> | FilterGroup<DataType>,
    skipEmptyFilter = true,
  ) => {
    return (data: DataType) =>
      filterPredicate(schema, data, rule, skipEmptyFilter);
  };

  const filterData = <T extends DataType, R extends T>(
    data: T[],
    rule: FieldFilter<R> | FilterGroup<R>,
    skipEmptyFilter = true,
  ): T[] => {
    const predicate = createFilterFn(rule, skipEmptyFilter);
    return data.filter(predicate);
  };

  const createFilterGroup = (
    op: FilterGroup<DataType>["op"],
    rules: (FieldFilter<DataType> | FilterGroup<DataType>)[],
  ): FilterGroup<DataType> => {
    return {
      filterType: "FilterGroup",
      op,
      conditions: rules,
    };
  };

  const serializeFieldFilter = (
    rule: FieldFilter<DataType> | FilterGroup<DataType>,
  ) => {
    // TODO support group
    // TODO check cannot serialized arguments
    // TODO types
    if (rule.filterType === "FilterGroup") {
      throw new Error("Not implemented yet!");
    }
    return JSON.stringify({
      type: "Filter",
      name: rule.name,
      field: rule.field,
      arguments: rule.getPlaceholderArguments(),
    });
  };

  const deserializeFieldFilter = (data: string) => {
    // TODO types
    type serializedFilter = any;
    const parsed: serializedFilter = JSON.parse(data);
    if (parsed.type !== "Filter") {
      throw new Error("Invalid data!");
    }
    const filter = state.filter[parsed.name];
    if (!filter) {
      throw new Error("Filter not found!");
    }

    const result = createFieldFilter<DataType>(filter, parsed.field);
    result.input(...parsed.arguments);
    return result;
  };

  return {
    _state: state,
    schema,

    getField,
    createFilterGroup,
    filterData,

    serializeFieldFilter,
    deserializeFieldFilter,
  };
};
