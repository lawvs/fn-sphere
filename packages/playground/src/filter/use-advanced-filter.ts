import { createFilterPredicate, type FilterGroup } from "@fn-sphere/core";
import { useState } from "react";
import {
  defaultOptions,
  openFlattenFilterDialog,
  type CreateAdvancedFilterProps,
} from "./create-advanced-filter.js";
import { defaultStorage } from "./default-storage.js";

export type UseAdvancedFilterProps<Data = unknown> =
  CreateAdvancedFilterProps<Data>;

/**
 * Hook to create a filter instance.
 *
 * @public
 * @example
 * ```tsx
 * const { rule, predicate, openFilter } = useFilter({
 *   schema: schema,
 *   filterList: filterList,
 * });
 *
 * await openFilter();
 * data.filter(predicate);
 * ```
 */
export const useAdvancedFilter = <Data>(
  userOptions: UseAdvancedFilterProps<Data>,
) => {
  const options: Required<UseAdvancedFilterProps<Data>> = {
    ...defaultOptions,
    ...userOptions,
  };
  const [loading, setLoading] = useState(true);
  const [rule, setRule] = useState<FilterGroup>(() => {
    const defaultState = options.defaultRule;
    const storageKey = options.storageKey;
    if (!storageKey) return defaultState;
    const abortController = new AbortController();
    (async () => {
      try {
        const rule = await defaultStorage.getItem(storageKey);
        if (abortController.signal.aborted) return;
        setRule(rule);
      } catch (error) {
        // console.error("Failed to get filter rule from storage", error);
      } finally {
        setLoading(false);
      }
    })();
    return defaultState;
  });
  const [isOpen, setIsOpen] = useState(false);

  return {
    rule,
    predicate: createFilterPredicate({
      schema: options.schema,
      filterList: options.filterList,
      rule,
    }),
    openFilterDialog: async ({
      abortSignal,
    }: {
      abortSignal?: AbortSignal;
    } = {}) => {
      if (isOpen) {
        console.error("The filter dialog is already open.");
        return;
      }
      if (loading) {
        throw new Error("The filter dialog is not ready yet.");
      }
      try {
        setIsOpen(true);
        const data = await openFlattenFilterDialog({
          filterBuilder: {
            schema: options.schema,
            filterList: options.filterList,
            fieldDeepLimit: options.fieldDeepLimit,
            defaultRule: rule,
          },
          ...options,
          abortSignal,
        });
        setRule(data.rule);
        if (options.storageKey) {
          defaultStorage.setItem(options.storageKey, data.rule);
        }
      } catch (error) {
        // console.error("User closed the filter dialog", error);
        return;
      } finally {
        setIsOpen(false);
      }
    },
  };
};
