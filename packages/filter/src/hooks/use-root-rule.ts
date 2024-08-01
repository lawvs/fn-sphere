import { type FilterGroup } from "@fn-sphere/core";
import { fromFilterMap, toFilterMap } from "../filter-map.js";
import { useFilterBuilderContext } from "./use-filter-builder-context.js";

export const useRootRule = () => {
  const {
    schema,
    filterList,
    filterMap,
    mapFieldName,
    mapFilterName,
    onRuleChange,
  } = useFilterBuilderContext();

  const getRootRule = () => {
    return fromFilterMap(filterMap);
  };

  const updateRootRule = (rootGroup: FilterGroup) => {
    onRuleChange(toFilterMap(rootGroup));
  };

  return {
    schema,
    filterList,
    numberOfRules: Object.keys(filterMap).length,

    mapFieldName,
    mapFilterName,
    getRootRule,
    updateRootRule,
  };
};
