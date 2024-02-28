import { z } from "zod";
import type { FieldFilter, FilterGroup, FnSchema } from "../types.js";
import { get } from "../utils.js";

// **Parameter** is the variable in the declaration of the function.
// **Argument** is the actual value of this variable that gets passed to the function.
const getRequiredParameters = (inputFilter: FnSchema) => {
  const fullParameters = inputFilter.define.parameters();
  if (!fullParameters.items.length) {
    console.error(
      "Invalid filter parameters!",
      inputFilter,
      inputFilter.define.parameters(),
    );
    throw new Error("Invalid filter parameters!");
  }
  // https://github.com/colinhacks/zod/blob/a5a9d31018f9c27000461529c582c50ade2d3937/src/types.ts#L3268
  const rest = fullParameters._def.rest;
  // TODO fix should not return empty tuple
  const stillNeed = z.tuple(fullParameters.items.slice(1));
  if (!rest) {
    return stillNeed;
  }
  return stillNeed.rest(rest);
};

export const createFieldFilter = <T>(
  filterSchema: FnSchema,
  field: string,
): FieldFilter<T> => {
  const requiredParameters = getRequiredParameters(filterSchema);

  const state = {
    invert: false,
    ready: requiredParameters.items.length === 0,
    placeholderArguments: [] as unknown[],
  };

  return {
    _state: state,
    schema: filterSchema,
    filterType: "Filter",
    field,
    requiredParameters,
    getPlaceholderArguments: () => state.placeholderArguments,
    isInvert: () => state.invert,
    setInvert: (invert) => (state.invert = invert),
    ready: () => state.ready,
    reset: () => {
      state.placeholderArguments = [];
      state.ready = false;
    },
    input: (...args: unknown[]) => {
      const rest = requiredParameters._def.rest;
      if (
        (!rest && requiredParameters.items.length !== args.length) ||
        (rest && requiredParameters.items.length > args.length)
      ) {
        console.error(
          "Invalid input parameters!",
          filterSchema.name,
          filterSchema,
          args,
          requiredParameters,
        );
        throw new Error("Invalid input parameters!");
      }
      state.placeholderArguments = args;
      state.ready = true;
    },
    turnToGroup: (op) => {
      return {
        filterType: "FilterGroup",
        op,
        conditions: [createFieldFilter(filterSchema, field)],
      };
    },
  };
};

export const filterPredicate = <T>(
  dataSchema: z.ZodType<T>,
  data: T,
  rule: FieldFilter<T> | FilterGroup<T>,
  skipEmptyRule = true,
): boolean => {
  if (rule.filterType === "Filter") {
    const field = rule.field;
    if (!rule.ready()) {
      if (skipEmptyRule) {
        return true;
      }
      throw new Error("Missing input parameters!");
    }
    const item = dataSchema.parse(data);
    const value = get(item, field);
    const invert = rule.isInvert();
    const filterSchema = rule.schema;
    const skipValidate = filterSchema.skipValidate;
    // Returns a new function that automatically validates its inputs and outputs.
    // See https://zod.dev/?id=functions
    const fnWithImplement = skipValidate
      ? filterSchema.implement
      : filterSchema.define.implement(filterSchema.implement);
    const result = fnWithImplement(value, ...rule.getPlaceholderArguments());
    return invert ? !result : result;
  }
  if (rule.filterType === "FilterGroup") {
    if (!rule.conditions.length) {
      return true;
    }
    if (rule.op === "or") {
      return rule.conditions.some((condition) =>
        filterPredicate(dataSchema, data, condition),
      );
    }
    if (rule.op === "and") {
      return rule.conditions.every((condition) =>
        filterPredicate(dataSchema, data, condition),
      );
    }
    throw new Error("Invalid op: " + rule.op);
  }
  console.error("Invalid rule type", rule);
  throw new Error("Invalid rule type!");
};

export const bfsSchemaField = (
  schema: z.ZodType,
  maxDeep: number,
  walk: (field: z.ZodSchema, path: string) => void,
) => {
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

    if (!(current.schema instanceof z.ZodObject)) {
      continue;
    }
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
};

export const isFilterFn = (fn: FnSchema) => {
  if (!(fn.define.returnType() instanceof z.ZodBoolean)) {
    console.error("Filter should return boolean!", fn);
    return false;
  }
  const parameters = fn.define.parameters();
  if (parameters.items.length === 0) {
    console.error("Filter should have at least one parameter!", fn);
    return false;
  }
  return true;
};
