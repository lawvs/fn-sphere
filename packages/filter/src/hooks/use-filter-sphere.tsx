import {
  countNumberOfRules,
  createFilterGroup,
  createFilterPredicate,
  createSingleFilter,
  presetFilter,
  type FilterGroup,
} from "@fn-sphere/core";
import { useState } from "react";
import { z } from "zod";
import type { BasicFilterSphereInput } from "../types.js";
import {
  defaultGetLocaleText,
  defaultMapFieldName,
  defaultMapFilterName,
  noop,
} from "../utils.js";
import type { FilterSchemaContext } from "./use-filter-schema-context.js";

export interface FilterSphereInput<Data> extends BasicFilterSphereInput<Data> {
  /**
   * The filter rule.
   *
   * If provided, the filter rule will be controlled.
   * Don't forget to update the rule when it changes.
   *
   * This prop will overwrite the `defaultRule` prop.
   */
  ruleValue?: FilterGroup;
  defaultRule?: FilterGroup;
  /**
   * The callback when the filter rule changes.
   */
  onRuleChange?: (rule: FilterGroup) => void;
  /**
   * Same as `onRuleChange`, but receives the predicate function.
   */
  onPredicateChange?: (predicate: (data: Data) => boolean) => void;
}

export const defaultContext: FilterSchemaContext = {
  schema: z.unknown(),
  filterFnList: presetFilter,
  filterRule: createFilterGroup(),
  fieldDeepLimit: 1,
  mapFieldName: defaultMapFieldName,
  mapFilterName: defaultMapFilterName,
  getLocaleText: defaultGetLocaleText,
  onRuleChange: noop,
};

/**
 *
 * Provides a predicate function that can be used to filter data.
 *
 * Must be used within a `FilterSchemaProvider` or `FilterSphereProvider` component.
 *
 * @example
 * ```ts
 * const { getPredicate, context } = useFilterSphere<YourData>({ schema: yourDataSchema });
 * const predicate = getPredicate();
 * const filteredData = data.filter(predicate);
 * ```
 */
export const useFilterSphere = <Data,>(props: FilterSphereInput<Data>) => {
  const {
    schema,
    ruleValue: inputFilterRule,
    defaultRule = createFilterGroup({
      op: "and",
      conditions: [createSingleFilter()],
    }),
    filterFnList = presetFilter,
    onRuleChange,
    onPredicateChange,
  } = props;
  // This state will be used only when the filterSphere is uncontrolled.
  const [ruleState, setRuleState] = useState<FilterGroup>(defaultRule);
  const isControlled = inputFilterRule !== undefined;
  const realRule = isControlled ? inputFilterRule : ruleState;

  const onRuleChangeInternal = (newRule: FilterGroup) => {
    // if (!isControlled)
    setRuleState(newRule);
    onRuleChange?.(newRule);
    if (onPredicateChange) {
      const predicate = createFilterPredicate({
        schema,
        filterFnList,
        filterRule: newRule,
      });
      onPredicateChange(predicate);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { defaultRule: _, ...contextProps } = props;
  const context: FilterSchemaContext<Data> = {
    ...defaultContext,
    ...contextProps,
    filterRule: realRule,
    onRuleChange: onRuleChangeInternal,
  };

  const getPredicate = () =>
    createFilterPredicate({
      schema,
      filterFnList,
      filterRule: realRule,
    });

  const countTotalRules = () => countNumberOfRules(realRule);

  const reset = (newRule: FilterGroup = defaultRule) => {
    onRuleChangeInternal(newRule);
  };

  return {
    filterRule: realRule,
    countTotalRules,
    getPredicate,
    reset,
    context,
  };
};
