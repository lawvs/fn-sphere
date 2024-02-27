import { ZodType, z } from "zod";
import type {
  InputFilter,
  ZodFilterFn,
  FieldFilter,
  FilterGroup,
} from "../types.js";
import { get } from "../utils.js";

// **Parameter** is the variable in the declaration of the function.
// **Argument** is the actual value of this variable that gets passed to the function.
const getRequiredParameters = (inputFilter: InputFilter<ZodFilterFn>) => {
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
  inputFilter: InputFilter<ZodFilterFn>,
  field: string,
): FieldFilter<T> => {
  const requiredParameters = getRequiredParameters(inputFilter);

  const state = {
    invert: false,
    ready: requiredParameters.items.length === 0,
    placeholderArguments: [] as unknown[],
  };

  return {
    ...inputFilter,
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
          inputFilter.name,
          inputFilter,
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
        conditions: [createFieldFilter(inputFilter, field)],
      };
    },
  };
};

export const filterPredicate = <T>(
  schema: ZodType<T>,
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
    const item = schema.parse(data);
    const value = get(item, field);
    const invert = rule.isInvert();
    // Returns a new function that automatically validates its inputs and outputs.
    // See https://zod.dev/?id=functions
    const fnWithValidates = rule.define.implement(rule.implement);
    const result = fnWithValidates(value, ...rule.getPlaceholderArguments());
    return invert ? !result : result;
  }
  if (rule.filterType === "FilterGroup") {
    if (!rule.conditions.length) {
      return true;
    }
    if (rule.op === "or") {
      return rule.conditions.some((condition) =>
        filterPredicate(schema, data, condition),
      );
    }
    if (rule.op === "and") {
      return rule.conditions.every((condition) =>
        filterPredicate(schema, data, condition),
      );
    }
    throw new Error("Invalid op: " + rule.op);
  }
  console.error("Invalid rule type", rule);
  throw new Error("Invalid rule type!");
};
