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
  createFilterGroup,
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
  rule: FilterGroup;
  onRuleChange: (filterMap: FilterMap) => void;

  // derived properties
  filterMap: FilterMap;
  filterableFields: FilterField[];
};

const defaultContext: NormalizedFilterContextType = {
  schema: z.unknown(),
  filterList: presetFilter,
  rule: createFilterGroup(),
  fieldDeepLimit: 1,
  mapFieldName: defaultMapFieldName,
  mapFilterName: defaultMapFilterName,

  filterMap: toFilterMap(createFilterGroup()),
  filterableFields: [],
  onRuleChange: () => {},
};

const FilterSchemaContext =
  createContext<NormalizedFilterContextType>(defaultContext);

/**
 * @internal
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useFilterSchemaContext = () => useContext(FilterSchemaContext);

export const FilterSchemaProvider = ({
  value,
  children,
}: {
  value: FilterContextType;
  children?: ReactNode;
}) => {
  const filterList = value.filterList ?? defaultContext.filterList;
  const fieldDeepLimit = value.fieldDeepLimit ?? defaultContext.fieldDeepLimit;

  const filterableFields = findFilterableFields({
    schema: value.schema,
    filterList,
    maxDeep: fieldDeepLimit,
  });

  const contextValue = {
    rule: value.filterRule,
    filterList,
    fieldDeepLimit: fieldDeepLimit,
    mapFieldName: value.mapFieldName ?? defaultContext.mapFieldName,
    mapFilterName: value.mapFilterName ?? defaultContext.mapFilterName,
    schema: value.schema,
    onRuleChange: (filterMap: FilterMap) => {
      value.onRuleChange?.(fromFilterMap(filterMap));
    },
    filterMap: toFilterMap(value.filterRule),
    filterableFields,
  } satisfies NormalizedFilterContextType;

  return (
    <FilterSchemaContext.Provider value={contextValue}>
      {children}
    </FilterSchemaContext.Provider>
  );
};
