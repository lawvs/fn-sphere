import type { ZodTypeAny } from "zod";
import type { FnSchema, StandardFnSchema } from "../types.js";
import type {
  FilterGroup,
  FilterPath,
  FilterRule,
  FilterRuleWrapper,
  StrictFilterRule,
} from "./types.js";
import { genFilterId, getRequiredParameters } from "./utils.js";
import { validateRule } from "./validate.js";

export const createGroupRule = <T>(
  op: FilterGroup<T>["op"],
  rules: (FilterRuleWrapper<T> | FilterGroup<T>)[],
): FilterGroup<T> => {
  return {
    id: genFilterId(),
    type: "FilterGroup",
    op,
    conditions: rules,
    invert: false,
  };
};

export const createFilterRule = ({
  fnSchema,
  dataSchema,
  path,
  input,
}: {
  fnSchema: FnSchema;
  dataSchema: ZodTypeAny;
  path: FilterPath;
  input: unknown[];
}): StrictFilterRule | undefined => {
  const rule: FilterRule = {
    id: genFilterId(),
    type: "Filter",
    name: fnSchema.name,
    path,
    arguments: input,
    invert: false,
  };
  const result = validateRule({
    filterList: [fnSchema],
    dataSchema,
    rule,
  });
  if (!result.success) {
    return;
  }
  return rule;
};

/**
 * @deprecated The core should not handle user input directly.
 */
export const createFilterWrapper = <T>(
  fnSchema: StandardFnSchema,
  path: FilterPath,
  userInput?: unknown[],
): FilterRuleWrapper<T> => {
  const requiredParameters = getRequiredParameters(fnSchema);

  const state: FilterRule = {
    id: genFilterId(),
    type: "Filter",
    name: fnSchema.name,
    path,
    arguments: [],
    invert: false,
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
    state.arguments = args;
  };

  if (userInput) {
    input(...userInput);
  }

  return {
    _state: state,
    type: "Filter",
    schema: fnSchema,
    path,
    requiredParameters,
    getPlaceholderArguments: () => state.arguments,
    isInvert: () => state.invert,
    setInvert: (invert) => (state.invert = invert),
    ready: () => {
      return (
        requiredParameters.items.length === 0 ||
        state.arguments.length === requiredParameters.items.length
      );
    },
    reset: () => {
      state.arguments = [];
    },
    input,
    turnToGroup: (op) =>
      createGroupRule(op, [
        createFilterWrapper(fnSchema, path, state.arguments),
      ]),
    duplicate: () => {
      return createFilterWrapper(fnSchema, path, state.arguments);
    },
  };
};
