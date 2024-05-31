import { createFilterPredicate, type LooseFilterGroup } from "@fn-sphere/core";
import { useEffect, useState } from "react";
import {
  defaultOptions,
  openFlattenFilter,
  type CreateFilterProps,
} from "./create-filter";
import { EMPTY_ROOT_FILTER, defaultStorage } from "./utils";

export type UseFilterProps<Data = unknown> = CreateFilterProps<Data>;

const defaultState = {
  rule: EMPTY_ROOT_FILTER,
  predicate: () => true,
};

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
  const [filterInfo, setFilterInfo] = useState<{
    rule: LooseFilterGroup;
    predicate: (data: Data) => boolean;
  }>(defaultState);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // FIX defaultRule is not working
    if (filterInfo !== defaultState || !options.storageKey) return;
    const storageKey = options.storageKey;
    const abortController = new AbortController();
    (async () => {
      try {
        const rule = await defaultStorage.getItem(storageKey);
        if (abortController.signal.aborted) return;
        const predicate = createFilterPredicate({
          schema: options.schema,
          filterList: options.filterList,
          rule,
        });
        setFilterInfo({ rule, predicate });
      } catch (error) {
        // console.error("Failed to get filter rule from storage", error);
        return;
      }
    })();
    return () => {
      abortController.abort();
    };
  }, [filterInfo, options.filterList, options.schema, options.storageKey]);
  return {
    ...filterInfo,
    openFilter: async ({
      abortSignal,
    }: {
      abortSignal?: AbortSignal;
    } = {}) => {
      if (isOpen) {
        console.error("The filter dialog is already open.");
        return;
      }
      try {
        setIsOpen(true);
        const data = await openFlattenFilter({
          filterBuilder: {
            schema: options.schema,
            filterList: options.filterList,
            deepLimit: options.deepLimit,
            defaultRule: filterInfo.rule,
          },
          ...options,
          abortSignal,
        });
        setFilterInfo(data);
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
