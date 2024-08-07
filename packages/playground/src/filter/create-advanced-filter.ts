import {
  createFilterPredicate,
  presetFilter,
  type FilterGroup,
} from "@fn-sphere/core";
import {
  createFilterGroup,
  createSingleFilter,
  defaultMapFieldName,
  defaultMapFilterName,
  type BasicFilterSphereInput,
} from "@fn-sphere/filter";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { z } from "zod";
import { defaultStorage } from "./default-storage.js";
import {
  FlattenFilterDialog,
  type FlattenFilterDialogProps,
} from "./flatten-filter-dialog.js";

type OpenFilterProps<Data = unknown> = {
  filterBuilder: BasicFilterSphereInput<Data> & {
    // uncontrolled mode only for the dialog
    defaultRule: FilterGroup | undefined;
  };
  dialogProps?: FlattenFilterDialogProps<Data>["dialogProps"];
  container?: HTMLElement | null;
  abortSignal?: AbortSignal;
};

export type CreateAdvancedFilterProps<Data = unknown> =
  BasicFilterSphereInput<Data> & {
    defaultRule?: FilterGroup;
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
    container?: NonNullable<OpenFilterProps<Data>["container"]> | null;
  };

export const openFlattenFilterDialog = async <Data>(
  options: OpenFilterProps<Data>,
): Promise<{
  rule: FilterGroup;
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
    rule: FilterGroup;
    predicate: (data: Data) => boolean;
  }>();

  root.render(
    createElement(FlattenFilterDialog, {
      open: true,
      filterBuilder: options.filterBuilder,
      dialogProps: {
        ...options.dialogProps,
        onClose: (ctx) => {
          root.unmount();
          if (isFallbackContainer) {
            container.remove();
          }
          resolvers.reject(ctx);
          options.dialogProps?.onClose?.(ctx);
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
  filterFnList: presetFilter,
  fieldDeepLimit: 1,
  mapFieldName: defaultMapFieldName,
  mapFilterName: defaultMapFilterName,
  getLocaleText: (key) => key,
  storageKey: null,
  container: null,
  dialogProps: {},
  defaultRule: createFilterGroup({
    op: "or",
    conditions: [
      createFilterGroup({ op: "and", conditions: [createSingleFilter()] }),
    ],
  }),
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
      filterFnList: options.filterFnList,
      filterRule: rule,
    });
    return predicate;
  };

  return {
    getRule,
    getPredicate,
    openFilterDialog: async (
      props: {
        abortSignal?: AbortSignal;
      } = {},
    ) => {
      const r = await getRule();
      const result = await openFlattenFilterDialog({
        filterBuilder: {
          schema: options.schema,
          filterFnList: options.filterFnList,
          fieldDeepLimit: options.fieldDeepLimit,
          mapFieldName: options.mapFieldName,
          mapFilterName: options.mapFilterName,
          defaultRule: r,
        },
        ...options,
        ...props,
      });
      rule = result.rule;
      if (options.storageKey) {
        defaultStorage.setItem(options.storageKey, rule);
      }
      return result;
    },
  };
};
