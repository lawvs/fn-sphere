import {
  type FilterField,
  type FilterGroup,
  findFilterableFields,
} from "@fn-sphere/core";
import { createContext, type ReactNode, useContext } from "react";
import { z } from "zod";
import { type FilterMap, fromFilterMap, toFilterMap } from "../filter-map.js";
import type { BasicFilterSphereInput } from "../types.js";
import {
  createFilterGroup,
  defaultMapFieldName,
  defaultMapFilterName,
  noop,
} from "../utils.js";

export interface FilterSchemaContext<Data = unknown>
  extends Readonly<Required<BasicFilterSphereInput<Data>>> {
  readonly filterRule: FilterGroup;
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

export const FilterSchemaProvider = ({
  value,
  children,
}: {
  value: FilterSchemaContext;
  children?: ReactNode;
}) => {
  const filterableFields = findFilterableFields({
    schema: value.schema,
    filterFnList: value.filterFnList,
    maxDeep: value.fieldDeepLimit,
  });

  const { onRuleChange, ...valueWithoutRuleChange } = value;

  const contextValue: InternalFilterContextType = {
    ...valueWithoutRuleChange,
    onFilterMapChange: (filterMap: FilterMap) => {
      onRuleChange?.(fromFilterMap(filterMap));
    },
    filterMap: toFilterMap(value.filterRule),
    filterableFields,
  };

  return (
    <FilterSchemaContext.Provider value={contextValue}>
      {children}
    </FilterSchemaContext.Provider>
  );
};
