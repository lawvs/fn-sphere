import { ZodType, z } from "zod";
import type {
  FilterFnSchema,
  ZodFilterFn,
  FieldFilter,
  FilterGroup,
} from "../types.js";
import { get } from "../utils.js";

// **Parameter** is the variable in the declaration of the function.
// **Argument** is the actual value of this variable that gets passed to the function.
const getRequiredParameters = (inputFilter: FilterFnSchema<ZodFilterFn>) => {
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
  filterSchema: FilterFnSchema<ZodFilterFn>,
  field: string,
): FieldFilter<T> => {
  const requiredParameters = getRequiredParameters(filterSchema);

  const state = {
    invert: false,
    ready: requiredParameters.items.length === 0,
    placeholderArguments: [] as unknown[],
  };

  return {
    schema: filterSchema,
    // state,
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
  dataSchema: ZodType<T>,
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
    // Returns a new function that automatically validates its inputs and outputs.
    // See https://zod.dev/?id=functions
    const fnWithValidates = filterSchema.define.implement(
      filterSchema.implement,
    );
    const result = fnWithValidates(value, ...rule.getPlaceholderArguments());
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
