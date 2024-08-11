import { z } from "zod";
import type { FnSchema } from "../types.js";
import { unreachable } from "../utils.js";
import type {
  FilterRule,
  StrictFilterGroup,
  StrictSingleFilter,
} from "./types.js";
import { and, getValueAtPath, or } from "./utils.js";
import { getRuleFilterSchema, normalizeFilter } from "./validation.js";

type FilterPredicateOptions<T> = {
  filterFnList: FnSchema[];
  /**
   * The schema of the data.
   */
  schema: z.ZodType<T>;
  /**
   * The filter rule.
   */
  filterRule?: FilterRule;
};

const trueFn = () => true as const;

const createSingleRulePredicate = <Data>({
  filterFnList,
  schema,
  strictSingleRule,
}: Omit<FilterPredicateOptions<Data>, "filterRule"> & {
  strictSingleRule: StrictSingleFilter;
}): ((data: Data) => boolean) => {
  const filterSchema = getRuleFilterSchema({
    rule: strictSingleRule,
    filterFnList: filterFnList,
    dataSchema: schema,
  });
  if (!filterSchema) {
    console.error(schema, strictSingleRule);
    throw new Error("Failed to get filter fn schema");
  }
  const skipValidate = filterSchema.skipValidate;
  // Returns a new function that automatically validates its inputs and outputs.
  // See https://zod.dev/?id=functions
  const fnWithImplement = skipValidate
    ? filterSchema.implement
    : filterSchema.define.implement(filterSchema.implement);

  return (data: Data): boolean => {
    const target = getValueAtPath(data, strictSingleRule.path);
    const result = fnWithImplement(target, ...strictSingleRule.args);
    return strictSingleRule.invert ? !result : result;
  };
};

const createGroupPredicate = <Data>({
  filterFnList,
  schema,
  strictGroupRule,
}: Omit<FilterPredicateOptions<Data>, "filterRule"> & {
  strictGroupRule: StrictFilterGroup;
}): ((data: Data) => boolean) => {
  if (!strictGroupRule.conditions.length) {
    return trueFn;
  }
  const predicateList = strictGroupRule.conditions.map((condition) => {
    if (condition.type === "Filter") {
      return createSingleRulePredicate({
        filterFnList,
        schema,
        strictSingleRule: condition,
      });
    }
    if (condition.type === "FilterGroup") {
      return createGroupPredicate({
        filterFnList,
        schema,
        strictGroupRule: condition,
      });
    }
    unreachable(condition);
  });
  if (strictGroupRule.op === "or") {
    return (data) => {
      const result = or<(data: Data) => boolean>(...predicateList)(data);
      return strictGroupRule.invert ? !result : result;
    };
  }
  if (strictGroupRule.op === "and") {
    return (data) => {
      const result = and<(data: Data) => boolean>(...predicateList)(data);
      return strictGroupRule.invert ? !result : result;
    };
  }
  unreachable(strictGroupRule.op);
};

/**
 * Creates a filter predicate function based on the provided filter rule.
 */
export const createFilterPredicate = <Data>({
  filterFnList,
  schema,
  filterRule,
}: FilterPredicateOptions<Data>) => {
  if (!filterRule) {
    return trueFn;
  }
  const normalizedRule = normalizeFilter({
    filterFnList: filterFnList,
    dataSchema: schema,
    rule: filterRule,
  });
  if (!normalizedRule) {
    // Not available rule
    return trueFn;
  }
  if (normalizedRule.type === "Filter") {
    return createSingleRulePredicate({
      filterFnList,
      schema,
      strictSingleRule: normalizedRule,
    });
  }
  if (normalizedRule.type === "FilterGroup") {
    return createGroupPredicate({
      filterFnList,
      schema,
      strictGroupRule: normalizedRule,
    });
  }
  unreachable(normalizedRule);
};
