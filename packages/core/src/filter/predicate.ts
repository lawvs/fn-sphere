import type { $ZodType } from "zod/v4/core";
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
  schema: $ZodType<T>;
  /**
   * The filter rule.
   */
  filterRule: FilterRule;

  /**
   * The value to return when the filter rule is not available or an error is caught
   *
   * When returning `true`, the data item will be included in the filtered results, otherwise it will be excluded.
   *
   * @default true
   */
  fallbackValue: boolean;
};

type ErrorHandlingOption = {
  /**
   * Whether to catch errors thrown during predicate execution
   *
   * @default true
   */
  catchError: boolean;
  /**
   * Whether to log the error to console when caught
   */
  logError: boolean;
};

type SafeFilterPredicateOptions<T> = Omit<
  FilterPredicateOptions<T>,
  "fallbackValue"
> & {
  // Make fallbackValue optional with default true
  /**
   * Will return this value when an error is caught or the filter rule is not provided
   *
   * @default true
   */
  fallbackValue?: boolean;
  /**
   * Error handling configuration.
   * @default { catchError: true, logError: true }
   */
  errorHandling?: ErrorHandlingOption;
};

/**
 * Default error handling: catch errors, return true, and log
 */
const DEFAULT_ERROR_HANDLING: ErrorHandlingOption = {
  catchError: true,
  logError: true,
};

const trueFn = () => true as const;
const falseFn = () => false as const;

const createSingleRulePredicate = <Data>({
  filterFnList,
  schema,
  strictSingleRule,
}: Omit<FilterPredicateOptions<Data>, "filterRule" | "fallbackValue"> & {
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
    ? (filterSchema.implement as (...data: unknown[]) => boolean)
    : (filterSchema.define.implement(filterSchema.implement) as (
        ...data: unknown[]
      ) => boolean);

  return (data: Data): boolean => {
    const target = getValueAtPath(data, strictSingleRule.path);
    const result = fnWithImplement(target, ...strictSingleRule.args);
    return strictSingleRule.invert ? !result : !!result;
  };
};

const createGroupPredicate = <Data>({
  filterFnList,
  schema,
  strictGroupRule,
  fallbackValue,
}: Omit<FilterPredicateOptions<Data>, "filterRule"> & {
  strictGroupRule: StrictFilterGroup;
}): ((data: Data) => boolean) => {
  if (!strictGroupRule.conditions.length) {
    return fallbackValue ? trueFn : falseFn;
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
        fallbackValue,
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
const createUnsafeFilterPredicate = <Data>({
  filterFnList,
  schema,
  filterRule,
  fallbackValue,
}: FilterPredicateOptions<Data>) => {
  if (!filterRule) {
    return fallbackValue ? trueFn : falseFn;
  }
  const normalizedRule = normalizeFilter({
    filterFnList: filterFnList,
    dataSchema: schema,
    rule: filterRule,
  });
  if (!normalizedRule) {
    // Not available rule
    return fallbackValue ? trueFn : falseFn;
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
      fallbackValue,
    });
  }
  unreachable(normalizedRule);
};

/**
 * Creates a safe filter predicate function with error handling.
 * Wraps createFilterPredicate with try-catch based on error handling options.
 */
export const createFilterPredicate = <Data>({
  filterFnList,
  schema,
  filterRule,
  fallbackValue = true,
  errorHandling = DEFAULT_ERROR_HANDLING,
}: SafeFilterPredicateOptions<Data>) => {
  const predicate = createUnsafeFilterPredicate({
    filterFnList,
    schema,
    filterRule,
    fallbackValue,
  });

  // If not catching errors, return the original predicate
  if (!errorHandling.catchError) {
    return predicate;
  }

  // Wrap with error handling
  return (data: Data): boolean => {
    try {
      return predicate(data);
    } catch (error) {
      if (errorHandling.logError) {
        console.error("Filter predicate error:", filterRule, data, error);
      }
      return fallbackValue;
    }
  };
};
