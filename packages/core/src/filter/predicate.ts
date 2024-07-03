import { z } from "zod";
import type { FnSchema } from "../types.js";
import { unreachable } from "../utils.js";
import type {
  LooseFilterGroup,
  LooseFilterRule,
  StrictFilterGroup,
  StrictFilterRule,
} from "./types.js";
import { getValueAtPath } from "./utils.js";
import { getRuleFilterSchema, normalizeFilter } from "./validation.js";

type FilterPredicateOptions<T> = {
  filterList: FnSchema[];
  /**
   * The schema of the data.
   */
  schema: z.ZodType<T>;
  /**
   * The filter rule.
   */
  rule?: LooseFilterRule | LooseFilterGroup;
  catch?: boolean;
};

const trueFn = () => true;

const createSingleRulePredicate = <Data>({
  filterList,
  schema,
  rule,
}: FilterPredicateOptions<Data> & {
  rule: StrictFilterRule;
}): ((data: Data) => boolean) => {
  const filterSchema = getRuleFilterSchema({
    rule,
    filterList,
    dataSchema: schema,
  });
  if (!filterSchema) {
    console.error(schema, rule);
    throw new Error("Failed to get filter fn schema");
  }
  const skipValidate = filterSchema.skipValidate;
  // Returns a new function that automatically validates its inputs and outputs.
  // See https://zod.dev/?id=functions
  const fnWithImplement = skipValidate
    ? filterSchema.implement
    : filterSchema.define.implement(filterSchema.implement);

  return (data: Data): boolean => {
    const target = getValueAtPath(data, rule.path);
    const result = fnWithImplement(target, ...rule.arguments);
    return rule.invert ? !result : result;
  };
};

const createGroupPredicate = <Data>({
  filterList,
  schema,
  rule,
}: Omit<FilterPredicateOptions<Data>, "rule"> & {
  rule: StrictFilterGroup;
}): ((data: Data) => boolean) => {
  if (!rule.conditions.length) {
    return trueFn;
  }
  const predicateList = rule.conditions.map((condition) => {
    if (condition.type === "Filter") {
      return createSingleRulePredicate({
        filterList,
        schema,
        rule: condition,
      });
    }
    if (condition.type === "FilterGroup") {
      return createGroupPredicate({
        filterList,
        schema,
        rule: condition,
      });
    }
    unreachable(condition);
  });
  if (rule.op === "or") {
    return (data) => {
      const result = predicateList.some((fn) => fn(data));
      return rule.invert ? !result : result;
    };
  }
  if (rule.op === "and") {
    return (data) => {
      const result = predicateList.every((fn) => fn(data));
      return rule.invert ? !result : result;
    };
  }
  unreachable(rule.op);
};

export const createFilterPredicate = <Data>({
  filterList,
  schema,
  rule: looseRule,
}: FilterPredicateOptions<Data>) => {
  if (!looseRule) {
    return trueFn;
  }
  const normalizedRule = normalizeFilter({
    filterList,
    dataSchema: schema,
    rule: looseRule,
  });
  if (!normalizedRule) {
    // Not available rule
    return trueFn;
  }
  if (normalizedRule.type === "Filter") {
    return createSingleRulePredicate({
      filterList,
      schema,
      rule: normalizedRule,
    });
  }
  if (normalizedRule.type === "FilterGroup") {
    return createGroupPredicate({
      filterList,
      schema,
      rule: normalizedRule,
    });
  }
  unreachable(normalizedRule);
};
