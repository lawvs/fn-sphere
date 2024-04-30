import { z } from "zod";
import type {
  FieldFilter,
  FilterGroup,
  Path,
  StandardFnSchema,
} from "../types.js";
import { getValueAtPath } from "../utils.js";
import { createFilterGroup } from "./utils.js";

// **Parameter** is the variable in the declaration of the function.
// **Argument** is the actual value of this variable that gets passed to the function.
const getRequiredParameters = (inputFilter: StandardFnSchema) => {
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
  filterSchema: StandardFnSchema,
  field: Path,
  userInput?: unknown[],
): FieldFilter<T> => {
  const requiredParameters = getRequiredParameters(filterSchema);

  const state = {
    invert: false,
    ready: requiredParameters.items.length === 0,
    placeholderArguments: [] as unknown[],
  };

  const input = (...args: unknown[]) => {
    const rest = requiredParameters._def.rest;
    if (
      !filterSchema.skipValidate &&
      ((!rest && requiredParameters.items.length !== args.length) ||
        (rest && requiredParameters.items.length > args.length))
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
  };

  if (userInput) {
    input(...userInput);
  }

  return {
    _state: state,
    type: "Filter",
    schema: filterSchema,
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
    input,
    turnToGroup: (op) =>
      createFilterGroup(op, [
        createFieldFilter(filterSchema, field, state.placeholderArguments),
      ]),
    duplicate: () => {
      return createFieldFilter(filterSchema, field, state.placeholderArguments);
    },
  };
};

export const filterPredicate = <T>(
  dataSchema: z.ZodType<T>,
  data: T,
  rule: FieldFilter<T> | FilterGroup<T>,
  skipEmptyRule = true,
): boolean => {
  if (rule.type === "Filter") {
    const field = rule.field;
    if (!rule.ready()) {
      if (skipEmptyRule) {
        return true;
      }
      throw new Error("Missing input parameters!");
    }
    const parseResult = dataSchema.safeParse(data);
    // TODO add option to skip validate
    if (!parseResult.success) {
      throw parseResult.error;
    }
    const item = parseResult.data;
    const value = getValueAtPath(item, field);
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

  if (rule.type === "FilterGroup") {
    if (!rule.conditions.length) {
      return true;
    }
    const invert = rule.isInvert();
    if (rule.op === "or") {
      const result = rule.conditions.some((condition) =>
        filterPredicate(dataSchema, data, condition),
      );
      return invert ? !result : result;
    }
    if (rule.op === "and") {
      const result = rule.conditions.every((condition) =>
        filterPredicate(dataSchema, data, condition),
      );
      return invert ? !result : result;
    }
    throw new Error("Invalid op: " + rule.op);
  }
  console.error("Invalid rule type", rule);
  throw new Error("Invalid rule type!");
};
