import {
  type FilterField,
  type FilterGroup,
  findFilterableFields,
} from "@fn-sphere/core";
import { type ReactNode, createContext } from "react";
import { z } from "zod";
import { type FilterMap, fromFilterMap, toFilterMap } from "../filter-map.js";
import type { BasicFilterProps } from "../types.js";
import {
  createEmptyFilterGroup,
  defaultMapFieldName,
  defaultMapFilterName,
} from "../utils.js";

type FilterContextType = {
  filterRule: FilterGroup;
  onRuleChange?: (filterGroup: FilterGroup) => void;
} & BasicFilterProps<unknown>;

type NormalizedFilterContextType = Required<BasicFilterProps<unknown>> & {
  onRuleChange: (filterMap: FilterMap) => void;

  // derived properties
  filterMap: FilterMap;
  filterableFields: FilterField[];
};

const defaultContext: NormalizedFilterContextType = {
  schema: z.unknown(),
  filterList: [],
  deepLimit: 1,
  mapFieldName: defaultMapFieldName,
  mapFilterName: defaultMapFilterName,

  filterMap: toFilterMap(createEmptyFilterGroup("or")),
  filterableFields: [],
  onRuleChange: () => {},
};

export const FilterBuilderContext =
  createContext<NormalizedFilterContextType>(defaultContext);

export const FilterProvider = ({
  value,
  children,
}: {
  value: FilterContextType;
  children: ReactNode;
}) => {
  const filterableFields = findFilterableFields({
    schema: value.schema,
    filterList: value.filterList,
    maxDeep: value.deepLimit,
  });

  const contextValue = {
    deepLimit: value.deepLimit ?? defaultContext.deepLimit,
    mapFieldName: value.mapFieldName ?? defaultContext.mapFieldName,
    mapFilterName: value.mapFilterName ?? defaultContext.mapFilterName,
    schema: value.schema,
    filterList: value.filterList,
    onRuleChange: (filterMap: FilterMap) => {
      value.onRuleChange?.(fromFilterMap(filterMap));
    },
    filterMap: toFilterMap(value.filterRule),
    filterableFields,
  };

  return (
    <FilterBuilderContext.Provider value={contextValue}>
      {children}
    </FilterBuilderContext.Provider>
  );
};
