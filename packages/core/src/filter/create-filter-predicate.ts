import { z } from "zod";
import type { FieldFilter, FilterGroup } from "./types.js";
import { getValueAtPath } from "./utils.js";

type FilterPredicateOptions<T> = {
  /**
   * The schema of the data.
   */
  schema: z.ZodType<T>;
  /**
   * The filter rule.
   */
  rule: FieldFilter<T> | FilterGroup<T>;
  skipEmptyRule?: boolean;
};

export const createFilterPredicate = <Data>({
  schema,
  rule,
  skipEmptyRule = true,
}: FilterPredicateOptions<Data>) => {
  function filterPredicateImpl(
    data: Data,
    rule: FieldFilter<Data> | FilterGroup<Data>,
  ): boolean {
    if (rule.type === "Filter") {
      const field = rule.field;
      if (!rule.ready()) {
        if (skipEmptyRule) {
          return true;
        }
        throw new Error("Missing input parameters!");
      }
      const parseResult = schema.safeParse(data);
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
          filterPredicateImpl(data, condition),
        );
        return invert ? !result : result;
      }
      if (rule.op === "and") {
        const result = rule.conditions.every((condition) =>
          filterPredicateImpl(data, condition),
        );
        return invert ? !result : result;
      }
      throw new Error("Invalid op: " + rule.op);
    }
    console.error("Invalid rule type", rule);
    throw new Error("Invalid rule type!");
  }
  // TODO check rule is match schema
  return (data: Data) => filterPredicateImpl(data, rule);
};
