import {
  commonFilters,
  createFilterPredicate,
  genericFilter,
  type LooseFilterGroup,
} from "@fn-sphere/core";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { z } from "zod";
import {
  FlattenFilterDialog,
  type FlattenFilterDialogProps,
} from "./flatten-filter-dialog";
import type { BasicFilterProps } from "./types";
import { EMPTY_ROOT_FILTER, defaultStorage } from "./utils";

type OpenFilterProps<Data = unknown> = {
  filterBuilder: BasicFilterProps<Data> & {
    // uncontrolled mode only for the dialog
    defaultRule: LooseFilterGroup | undefined;
  };
  dialogProps?: FlattenFilterDialogProps<Data>["dialogProps"];
  container?: HTMLElement | null;
  abortSignal?: AbortSignal;
};

export type CreateFilterProps<Data = unknown> = BasicFilterProps<Data> & {
  defaultRule?: LooseFilterGroup | undefined;
  /**
   *
   * Set `null` to disable storage.
   *
   * The default storage implementation uses `localStorage` for storage/retrieval, `JSON.stringify()`/`JSON.parse()` for serialization/deserialization.
   *
   * @default null
   */
  storageKey?: string | null;
  dialogProps?: OpenFilterProps<Data>["dialogProps"];
  container?: OpenFilterProps<Data>["container"];
};

export const openFlattenFilter = async <Data>(
  options: OpenFilterProps<Data>,
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
      filterBuilder: options.filterBuilder,
      dialogProps: {
        ...options.dialogProps,
        onClose: (e, reason) => {
          root.unmount();
          if (isFallbackContainer) {
            container.remove();
          }
          resolvers.reject(e);
          options.dialogProps?.onClose?.(e, reason);
        },
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

export const defaultOptions = {
  schema: z.any(),
  filterList: [...commonFilters, ...genericFilter],
  deepLimit: 1,
  storageKey: null,
  container: null,
  dialogProps: {},
  defaultRule: EMPTY_ROOT_FILTER,
} as const satisfies Required<CreateFilterProps>;

/**
 * Create a filter instance.
 *
 * @public
 */
export const createFilter = <Data>(userOptions: CreateFilterProps<Data>) => {
  const options: Required<CreateFilterProps<Data>> = {
    ...defaultOptions,
    ...userOptions,
  };
  let rule = options.defaultRule;

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
        filterBuilder: {
          schema: options.schema,
          filterList: options.filterList,
          deepLimit: options.deepLimit,
          defaultRule: r,
        },
        ...options,
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

async function getStorageRule(key: string | null) {
  if (!key) return;
  try {
    return await defaultStorage.getItem(key);
  } catch {
    return;
  }
}
