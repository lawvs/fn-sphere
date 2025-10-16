import {
  createFilterGroup,
  createSingleFilter,
  defineGenericFn,
  type FilterGroup,
} from "@fn-sphere/filter";
import { z } from "zod";
import type { $ZodNumber, $ZodString } from "zod/v4/core";

/**
 * Transforms a filter rule group into a parameter object.
 *
 * @example
 * ```ts
 * const ruleGroup = {
 *  op: 'and',
 * conditions: [
 *     { type: 'Filter', id: '1', path: ['ticket'], args: ['123'] },
 *     { type: 'Filter', id: '2', path: ['orderType'], args: ['0'] },
 *     { type: 'Filter', id: '3', path: [], args: [] },
 *   ],
 * }
 *
 * filterRuleTransform(ruleGroup)
 * // { ticket: '123', orderType: '0' }
 * ```
 */
export function filterRuleTransform<Data>(
  ruleGroup: FilterGroup,
): Partial<Data> {
  const object: Partial<Data> = {};
  for (const rule of ruleGroup.conditions) {
    if (rule.type === "FilterGroup") continue;
    if (!rule.path || rule.args.length === 0) continue;
    object[rule.path[0] as keyof Data] = rule.args[0] as Data[keyof Data];
  }
  return object;
}

export function createDefaultFilterRule<Data>(
  schema: z.ZodType,
  defaultParameter: Partial<Data> = {},
): FilterGroup {
  if (!(schema instanceof z.ZodObject)) {
    throw new TypeError("Only object schema is supported");
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- Ignore any type error
  const conditions = Object.keys(schema.shape).map((key) => {
    return createSingleFilter({
      name: basicFilterFunction.name,
      path: [key],
      args:
        key in defaultParameter ? [defaultParameter[key as keyof Data]] : [],
    });
  });
  return createFilterGroup({ op: "and", conditions });
}

/**
 * This is a placeholder filter function since we don't need filter data at frontend.
 *
 * It will match any field except the root schema.
 */
export const basicFilterFunction = defineGenericFn({
  name: "Equals",
  genericLimit: (t): t is $ZodString | $ZodNumber =>
    // Exclude the root schema
    t._zod.def.type !== "object",
  define: (t) =>
    z.function({
      input: [t, t],
      output: z.boolean(),
    }),
  implement: (value: unknown, target: unknown) => value === target,
});
