import {
  type FilterField,
  type FilterGroup,
  findFilterableFields,
  presetFilter,
} from "@fn-sphere/core";
import { createContext, type ReactNode, useContext } from "react";
import { z } from "zod";
import { type FilterMap, fromFilterMap, toFilterMap } from "../filter-map.js";
import type { BasicFilterBuilderProps } from "../types.js";
import {
  createEmptyFilterGroup,
  defaultMapFieldName,
  defaultMapFilterName,
} from "../utils.js";

type FilterContextType = {
  filterRule: FilterGroup;
  onRuleChange?: (filterGroup: FilterGroup) => void;
} & BasicFilterBuilderProps<unknown>;

type NormalizedFilterContextType = Required<
  BasicFilterBuilderProps<unknown>
> & {
  onRuleChange: (filterMap: FilterMap) => void;

  // derived properties
  filterMap: FilterMap;
  filterableFields: FilterField[];
};

const defaultContext: NormalizedFilterContextType = {
  schema: z.unknown(),
  filterList: presetFilter,
  deepLimit: 1,
  mapFieldName: defaultMapFieldName,
  mapFilterName: defaultMapFilterName,

  filterMap: toFilterMap(createEmptyFilterGroup("or")),
  filterableFields: [],
  onRuleChange: () => {},
};

const FilterBuilderContext =
  createContext<NormalizedFilterContextType>(defaultContext);

// eslint-disable-next-line react-refresh/only-export-components
export const useFilterBuilderContext = () => useContext(FilterBuilderContext);

export const FilterProvider = ({
  value,
  children,
}: {
  value: FilterContextType;
  children: ReactNode;
}) => {
  const filterList = value.filterList ?? presetFilter;

  const filterableFields = findFilterableFields({
    schema: value.schema,
    filterList,
    maxDeep: value.deepLimit,
  });

  const contextValue = {
    deepLimit: value.deepLimit ?? defaultContext.deepLimit,
    mapFieldName: value.mapFieldName ?? defaultContext.mapFieldName,
    mapFilterName: value.mapFilterName ?? defaultContext.mapFilterName,
    filterList,
    schema: value.schema,
    onRuleChange: (filterMap: FilterMap) => {
      value.onRuleChange?.(fromFilterMap(filterMap));
    },
    filterMap: toFilterMap(value.filterRule),
    filterableFields,
  } satisfies NormalizedFilterContextType;

  return (
    <FilterBuilderContext.Provider value={contextValue}>
      {children}
    </FilterBuilderContext.Provider>
  );
};
