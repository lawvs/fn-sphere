import type { LooseFilterGroup } from "@fn-sphere/core";
import { useContext } from "react";
import { fromFilterMap, toFilterMap } from "../utils.js";
import { FilterBuilderContext } from "./filter-provider.js";

export const useRootRule = () => {
  const { filterMap, onRuleChange } = useContext(FilterBuilderContext);

  const getRootRule = () => {
    return fromFilterMap(filterMap);
  };

  const updateRootRule = (rootGroup: LooseFilterGroup) => {
    onRuleChange(toFilterMap(rootGroup));
  };

  return { getRootRule, updateRootRule };
};
