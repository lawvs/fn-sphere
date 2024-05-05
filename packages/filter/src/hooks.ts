import { createFilterPredicate, type LooseFilterGroup } from "@fn-sphere/core";
import { useEffect, useState } from "react";
import {
  defaultOptions,
  openFlattenFilter,
  type FlattenFilterProps,
  type OpenFlattenFilterProps,
} from "./create-filter";
import type { FlattenFilterGroup } from "./types";
import { EMPTY_ROOT_FILTER, defaultStorage } from "./utils";

const defaultState = {
  rule: EMPTY_ROOT_FILTER,
  predicate: () => true,
};

export const useFilter = <Data>(
  userOptions: Omit<FlattenFilterProps<Data>, "rule">,
) => {
  const options: Omit<OpenFlattenFilterProps<Data>, "rule"> = {
    ...defaultOptions,
    ...userOptions,
  };
  const [filterInfo, setFilterInfo] = useState<{
    rule: LooseFilterGroup;
    predicate: (data: Data) => boolean;
  }>(defaultState);

  useEffect(() => {
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
    openFilter: async () => {
      try {
        const data = await openFlattenFilter({
          ...options,
          rule: filterInfo.rule as FlattenFilterGroup | undefined,
        });
        setFilterInfo(data);
        if (options.storageKey) {
          defaultStorage.setItem(options.storageKey, data.rule);
        }
        return data;
      } catch (error) {
        // console.error("User closed the filter dialog", error);
        return;
      }
    },
  };
};
