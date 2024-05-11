import {
  commonFilters,
  createFilterPredicate,
  genericFilter,
  type LooseFilterGroup,
} from "@fn-sphere/core";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { FlattenFilterDialog } from "./flatten-filter-dialog";
import type { FilterBuilderProps, FlattenFilterGroup } from "./types";
import { EMPTY_ROOT_FILTER, defaultStorage } from "./utils";

export type OpenFlattenFilterProps<Data = unknown> = {
  filterList: FilterBuilderProps<Data>["filterList"];
  schema: FilterBuilderProps<Data>["schema"];
  rule?: FilterBuilderProps<Data>["rule"];
  /**
   * The maximum depth of searching for filter fields.
   *
   * @default 1
   */
  deepLimit: number;

  container: HTMLElement | null;
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
  storage?: undefined;
  abortSignal?: AbortSignal;
};

export type FlattenFilterProps<Data> = Partial<OpenFlattenFilterProps<Data>> &
  Pick<OpenFlattenFilterProps<Data>, "schema">;

export const defaultOptions: Omit<OpenFlattenFilterProps, "schema"> = {
  container: null,
  storageKey: null,
  filterList: [...commonFilters, ...genericFilter],
  deepLimit: 1,
  rule: undefined,
};

export const openFlattenFilter = async <Data>(
  options: Omit<OpenFlattenFilterProps<Data>, "storageKey">,
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

  // const initialRule = options.rule;
  // ?? ((await getInitialRule(options.storageKey, undefined)) as
  //   | FlattenFilterGroup
  //   | undefined);

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
        // if (options.storageKey) {
        //   defaultStorage.setItem(options.storageKey, value.rule);
        // }
        resolvers.resolve(value);
      },
    }),
  );
  return resolvers.promise;
};

function getInitialRule(
  key: string | null,
  initialValue: LooseFilterGroup | undefined,
) {
  if (!key) return initialValue;
  try {
    // TODO Validating stored values
    return defaultStorage.getItem(key);
  } catch {
    return initialValue;
  }
}

export const createFilter = <Data>(
  userOptions: Omit<FlattenFilterProps<Data>, "rule">,
) => {
  const options: OpenFlattenFilterProps<Data> = {
    ...defaultOptions,
    ...userOptions,
  };
  const getRule = async () => {
    const rule =
      options.rule ??
      ((await getInitialRule(options.storageKey, undefined)) as
        | FlattenFilterGroup
        | undefined);

    const predicate = createFilterPredicate({
      schema: options.schema,
      filterList: options.filterList,
      rule,
    });
    return {
      rule: rule ?? EMPTY_ROOT_FILTER,
      // ruleCount: rule ? countNumberOfRules(rule) : 0,
      predicate,
    };
  };
  return {
    getRule,
    openFilter: () => openFlattenFilter(options),
  };
};
