import { type LooseFilterGroup } from "@fn-sphere/core";
import { useContext } from "react";
import { fromFilterMap, toFilterMap } from "../filter-map.js";
import { FilterBuilderContext } from "./filter-provider.js";

export const useRootRule = () => {
  const {
    schema,
    filterList,
    filterMap,
    mapFieldName,
    mapFilterName,
    onRuleChange,
  } = useContext(FilterBuilderContext);

  const getRootRule = () => {
    return fromFilterMap(filterMap);
  };

  const updateRootRule = (rootGroup: LooseFilterGroup) => {
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
