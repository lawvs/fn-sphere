import { type FilterGroup } from "@fn-sphere/core";
import { fromFilterMap, toFilterMap } from "../filter-map.js";
import { useFilterSchemaContext } from "./use-filter-schema-context.js";

export const useRootRule = () => {
  const {
    schema,
    filterList,
    filterMap,
    mapFieldName,
    mapFilterName,
    onRuleChange,
  } = useFilterSchemaContext();

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
