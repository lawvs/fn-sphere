import {
  countNumberOfRules,
  countValidRules,
  createDefaultRule,
  createFilterGroup,
  createFilterPredicate,
  findFilterableFields,
  presetFilter,
  type FilterGroup,
} from "@fn-sphere/core";
import { useState } from "react";
import { z } from "zod";
import { defaultGetLocaleText } from "../locales/get-locale-text.js";
import type { BasicFilterSphereInput } from "../types.js";
import { defaultMapFieldName, defaultMapFilterName, noop } from "../utils.js";
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
  defaultRule?: FilterGroup | (() => FilterGroup);
  /**
   * The callback when the filter rule changes.
   */
  onRuleChange?: (data: {
    filterRule: FilterGroup;
    predicate: (data: Data) => boolean;
  }) => void;
  /**
   * Same as `onRuleChange`, but receives the predicate function.
   *
   * @deprecated Use `onRuleChange` instead.
   */
  onPredicateChange?: (predicate: (data: Data) => boolean) => void;
}

export const defaultContext: FilterSchemaContext = {
  schema: z.unknown(),
  filterFnList: presetFilter,
  filterRule: createFilterGroup(),
  filterableFields: [],
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
 * const { predicate, context } = useFilterSphere<YourData>({ schema: yourDataSchema });
 * const filteredData = data.filter(predicate);
 * ```
 */
export const useFilterSphere = <Data,>(props: FilterSphereInput<Data>) => {
  const {
    schema,
    ruleValue: inputFilterRule,
    filterFnList = presetFilter,
    onRuleChange,
    onPredicateChange,
  } = props;

  const filterableFields = findFilterableFields({
    schema: props.schema,
    filterFnList,
    maxDeep: props.fieldDeepLimit ?? defaultContext.fieldDeepLimit,
  });
  const defaultRule =
    (typeof props.defaultRule === "function"
      ? props.defaultRule()
      : props.defaultRule) ??
    createFilterGroup({
      op: "and",
      conditions: [createDefaultRule(filterableFields)],
    });
  // This state will be used only when the filterSphere is uncontrolled.
  const [ruleState, setRuleState] = useState<FilterGroup>(defaultRule);
  const isControlled = inputFilterRule !== undefined;
  const realRule = isControlled ? inputFilterRule : ruleState;

  const onRuleChangeInternal = (newRule: FilterGroup) => {
    // if (!isControlled)
    setRuleState(newRule);
    onRuleChange?.({
      filterRule: newRule,
      get predicate() {
        return createFilterPredicate({
          schema,
          filterFnList,
          filterRule: newRule,
        });
      },
    });

    // deprecated
    if (onPredicateChange) {
      const predicate = createFilterPredicate({
        schema,
        filterFnList,
        filterRule: newRule,
      });
      onPredicateChange(predicate);
    }
    // end deprecated
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { defaultRule: _, ...contextProps } = props;
  const context: FilterSchemaContext<Data> = {
    ...defaultContext,
    ...contextProps,
    filterRule: realRule,
    filterableFields,
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

    /**
     * @deprecated Use `totalRuleCount` directly.
     */
    countTotalRules,
    get totalRuleCount() {
      return countNumberOfRules(realRule);
    },
    get validRuleCount() {
      return countValidRules({
        dataSchema: schema,
        filterFnList,
        rule: realRule,
      });
    },
    /**
     * @deprecated Use `predicate` directly.
     */
    getPredicate,
    get predicate() {
      return getPredicate();
    },
    reset,
    context,
  };
};
