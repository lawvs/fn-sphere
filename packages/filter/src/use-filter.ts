import { createFilterPredicate, type LooseFilterGroup } from "@fn-sphere/core";
import { useState } from "react";
import {
  defaultOptions,
  openFlattenFilter,
  type CreateFilterProps,
} from "./create-filter";
import { EMPTY_ROOT_FILTER, defaultStorage } from "./utils";

export type UseFilterProps<Data = unknown> = CreateFilterProps<Data>;

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
export const useFilter = <Data>(userOptions: UseFilterProps<Data>) => {
  const options: Required<UseFilterProps<Data>> = {
    ...defaultOptions,
    ...userOptions,
  };
  const [loading, setLoading] = useState(true);
  const [rule, setRule] = useState<LooseFilterGroup>(() => {
    const defaultState = options.defaultRule ?? EMPTY_ROOT_FILTER;
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
    openFilter: async ({
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
        const data = await openFlattenFilter({
          filterBuilder: {
            schema: options.schema,
            filterList: options.filterList,
            deepLimit: options.deepLimit,
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
