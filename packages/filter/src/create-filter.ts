import {
  commonFilters,
  createFilterPredicate,
  genericFilter,
  type LooseFilterGroup,
} from "@fn-sphere/core";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { FlattenFilterDialog } from "./flatten-filter-dialog";
import type { FilterBuilderProps } from "./types";
import { EMPTY_ROOT_FILTER, defaultStorage } from "./utils";

type OpenFlattenFilterProps<Data = unknown> = Omit<
  FilterBuilderProps<Data>,
  "onChange"
> & {
  container: HTMLElement | null;
  abortSignal?: AbortSignal;
};

export type CreateFilterProps<Data> = Partial<
  Omit<OpenFlattenFilterProps<Data>, "rule" | "abortSignal">
> &
  Pick<OpenFlattenFilterProps<Data>, "schema"> & {
    defaultRule: LooseFilterGroup | undefined;
    /**
     *
     * Set `null` to disable storage.
     *
     * The default storage implementation uses `localStorage` for storage/retrieval, `JSON.stringify()`/`JSON.parse()` for serialization/deserialization.
     *
     * @default null
     */
    storageKey: string | null;
    /**
     * TODO The storage option is not supported yet.
     *
     * See https://jotai.org/docs/utilities/storage#atomwithstorage
     */
    storage?: null;
  };

export const defaultOptions = {
  container: null,
  filterList: [...commonFilters, ...genericFilter],
  deepLimit: 1,
  rule: undefined,
} as const satisfies Omit<OpenFlattenFilterProps, "schema">;

export const openFlattenFilter = async <Data>(
  options: OpenFlattenFilterProps<Data>,
): Promise<{
  rule: LooseFilterGroup;
  predicate: (data: Data) => boolean;
}> => {
  const isFallbackContainer = !options.container;
  const container = options.container ?? document.createElement("div");
  if (isFallbackContainer) {
    container.setAttribute("id", "fn-sphere-flatten-filter-container");
    document.body.appendChild(container);
  }
  const root = createRoot(container);

  if (options.abortSignal) {
    const signal = options.abortSignal;
    if (signal.aborted) return Promise.reject(signal.reason);
    signal.addEventListener("abort", () => {
      root.unmount();
      if (isFallbackContainer) {
        container.remove();
      }
      return Promise.reject(signal.reason);
    });
  }

  const resolvers = Promise.withResolvers<{
    rule: LooseFilterGroup;
    predicate: (data: Data) => boolean;
  }>();
  root.render(
    createElement(FlattenFilterDialog, {
      open: true,
      filterBuilder: {
        schema: options.schema,
        filterList: options.filterList,
        deepLimit: options.deepLimit,
        defaultRule: options.rule,
      },
      onClose: (e) => {
        root.unmount();
        if (isFallbackContainer) {
          container.remove();
        }
        resolvers.reject(e);
      },
      onConfirm: (value) => {
        root.unmount();
        if (isFallbackContainer) {
          container.remove();
        }
        resolvers.resolve(value);
      },
    }),
  );
  return resolvers.promise;
};

async function getStorageRule(key: string | null) {
  if (!key) return;
  try {
    return await defaultStorage.getItem(key);
  } catch {
    return;
  }
}

/**
 * Create a filter instance.
 *
 * @public
 */
export const createFilter = <Data>(userOptions: CreateFilterProps<Data>) => {
  const options: Required<CreateFilterProps<Data>> = {
    ...defaultOptions,
    storage: null,
    ...userOptions,
  };
  let rule = userOptions.defaultRule ?? EMPTY_ROOT_FILTER;

  const getRule = async () => {
    const storageKey = options.storageKey;
    if (!storageKey) {
      return rule;
    }
    const storageRule = await getStorageRule(options.storageKey);
    if (!storageRule) {
      return rule;
    }
    rule = storageRule;
    return rule;
  };

  const getPredicate = async () => {
    const rule = await getRule();
    const predicate = createFilterPredicate({
      schema: options.schema,
      filterList: options.filterList,
      rule,
    });
    return predicate;
  };

  return {
    getRule,
    getPredicate,
    openFilter: async ({
      abortSignal,
    }: {
      abortSignal?: AbortSignal;
    } = {}) => {
      const r = await getRule();
      const result = await openFlattenFilter({
        ...options,
        rule: r,
        abortSignal,
      });
      rule = result.rule;
      if (options.storageKey) {
        defaultStorage.setItem(options.storageKey, rule);
      }
      return result;
    },
  };
};
