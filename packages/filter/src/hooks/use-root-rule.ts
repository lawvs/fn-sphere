import { type FilterGroup } from "@fn-sphere/core";
import { fromFilterMap, toFilterMap } from "../filter-map.js";
import { useFilterSchemaContext } from "./use-filter-schema-context.js";

export const useRootRule = () => {
  const {
    schema,
    filterFnList,
    filterMap,
    mapFieldName,
    mapFilterName,
    onFilterMapChange,
  } = useFilterSchemaContext();

  const getRootRule = () => {
    return fromFilterMap(filterMap);
  };

  const updateRootRule = (rootGroup: FilterGroup) => {
    onFilterMapChange(toFilterMap(rootGroup));
  };

  return {
    schema,
    filterFnList,
    numberOfRules: Object.keys(filterMap).length,

    mapFieldName,
    mapFilterName,
    getRootRule,
    updateRootRule,
  };
};
