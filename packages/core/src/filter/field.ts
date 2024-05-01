import { z } from "zod";
import type { FieldFilter, Path, StandardFnSchema } from "../types.js";
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
  fnSchema: StandardFnSchema,
  field: Path,
  userInput?: unknown[],
): FieldFilter<T> => {
  const requiredParameters = getRequiredParameters(fnSchema);

  const state = {
    invert: false,
    ready: requiredParameters.items.length === 0,
    placeholderArguments: [] as unknown[],
  };

  const input = (...args: unknown[]) => {
    if (!fnSchema.skipValidate) {
      const parseResult = requiredParameters.safeParse(args);
      if (!parseResult.success) {
        console.error(
          "Invalid input parameters!",
          fnSchema,
          args,
          requiredParameters,
        );
        throw parseResult.error;
      }
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
    schema: fnSchema,
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
        createFieldFilter(fnSchema, field, state.placeholderArguments),
      ]),
    duplicate: () => {
      return createFieldFilter(fnSchema, field, state.placeholderArguments);
    },
  };
};
