import {
  createFilterGroup,
  type FilterField,
  type FilterGroup,
} from "@fn-sphere/core";
import { createContext, type ReactNode, useContext, useMemo } from "react";
import { z } from "zod";
import { type FilterMap, fromFilterMap, toFilterMap } from "../filter-map.js";
import { defaultGetLocaleText } from "../locales/get-locale-text.js";
import type { BasicFilterSphereInput } from "../types.js";
import { defaultMapFieldName, defaultMapFilterName, noop } from "../utils.js";

export interface FilterSchemaContext<Data = unknown> extends Readonly<
  Required<BasicFilterSphereInput<Data>>
> {
  readonly filterRule: FilterGroup;
  readonly filterableFields: FilterField[];
  readonly onRuleChange?: (rule: FilterGroup) => void;
}

interface InternalFilterContextType extends FilterSchemaContext {
  filterRule: FilterGroup;
  onFilterMapChange: (filterMap: FilterMap) => void;

  // derived properties
  filterMap: FilterMap;
  filterableFields: FilterField[];
}

const defaultContext: InternalFilterContextType = {
  schema: z.unknown(),
  filterFnList: [],
  filterRule: createFilterGroup(),
  fieldDeepLimit: 1,
  mapFieldName: defaultMapFieldName,
  mapFilterName: defaultMapFilterName,
  getLocaleText: defaultGetLocaleText,

  filterMap: {},
  filterableFields: [],
  onFilterMapChange: noop,
};

const FilterSchemaContext =
  createContext<InternalFilterContextType>(defaultContext);

/**
 * @internal
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useFilterSchemaContext = () => useContext(FilterSchemaContext);

type FilterSchemaProviderProps = {
  context: FilterSchemaContext;
  children?: ReactNode;
};

export const FilterSchemaProvider = ({
  context,
  children,
}: FilterSchemaProviderProps) => {
  const { onRuleChange, ...valueWithoutRuleChange } = context;

  const contextValue: InternalFilterContextType = useMemo(
    () => ({
      ...valueWithoutRuleChange,
      onFilterMapChange: (filterMap: FilterMap) => {
        onRuleChange?.(fromFilterMap(filterMap));
      },
      filterMap: toFilterMap(context.filterRule),
    }),
    [context, onRuleChange, valueWithoutRuleChange],
  );

  return (
    <FilterSchemaContext value={contextValue}>{children}</FilterSchemaContext>
  );
};
