import {
  createFilterPredicate,
  presetFilter,
  type LooseFilterGroup,
} from "@fn-sphere/core";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { z } from "zod";
import {
  FlattenFilterDialog,
  type FlattenFilterDialogProps,
} from "./flatten-filter-dialog.js";
import type { BasicFilterProps } from "./types.js";
import {
  createEmptyFilterGroup,
  defaultMapFieldName,
  defaultMapFilterName,
  defaultStorage,
} from "./utils.js";

type OpenFilterProps<Data = unknown> = {
  filterBuilder: BasicFilterProps<Data> & {
    // uncontrolled mode only for the dialog
    defaultRule: LooseFilterGroup | undefined;
  };
  dialogProps?: FlattenFilterDialogProps<Data>["dialogProps"];
  container?: HTMLElement | null;
  abortSignal?: AbortSignal;
};

// See https://stackoverflow.com/questions/43159887/make-a-single-property-optional-in-typescript
type PartialBy<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export type CreateAdvancedFilterProps<Data = unknown> = PartialBy<
  BasicFilterProps<Data>,
  "filterList"
> & {
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

export const openFlattenFilterDialog = async <Data>(
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
  filterList: presetFilter,
  deepLimit: 1,
  mapFieldName: defaultMapFieldName,
  mapFilterName: defaultMapFilterName,
  storageKey: null,
  container: null,
  dialogProps: {},
  defaultRule: createEmptyFilterGroup("or"),
} as const satisfies Required<CreateAdvancedFilterProps>;

/**
 * Create a filter instance.
 *
 * @public
 */
export const createAdvancedFilter = <Data>(
  userOptions: CreateAdvancedFilterProps<Data>,
) => {
  const options: Required<CreateAdvancedFilterProps<Data>> = {
    ...defaultOptions,
    ...userOptions,
  };
  let rule = options.defaultRule;

  const getRule = async () => {
    const storageKey = options.storageKey;
    if (!storageKey) {
      return rule;
    }
    try {
      const storageRule = await defaultStorage.getItem(storageKey);
      rule = storageRule;
    } catch {
      // Do nothing
    }
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
    openFilterDialog: async ({
      abortSignal,
    }: {
      abortSignal?: AbortSignal;
    } = {}) => {
      const r = await getRule();
      const result = await openFlattenFilterDialog({
        filterBuilder: {
          schema: options.schema,
          filterList: options.filterList,
          deepLimit: options.deepLimit,
          mapFieldName: options.mapFieldName,
          mapFilterName: options.mapFilterName,
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
