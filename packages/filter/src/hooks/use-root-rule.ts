import { type FilterGroup } from "@fn-sphere/core";
import { useCallback } from "react";
import { toFilterMap } from "../filter-map.js";
import { useFilterSchemaContext } from "./use-filter-schema-context.js";

export const useRootRule = () => {
  const {
    schema,
    filterRule,
    filterFnList,
    filterMap,
    filterableFields,
    mapFieldName,
    mapFilterName,
    getLocaleText,
    onFilterMapChange,
  } = useFilterSchemaContext();

  const getRootRule = useCallback(() => {
    return filterRule;
  }, [filterRule]);

  const updateRootRule = useCallback(
    (rootGroup: FilterGroup) => {
      onFilterMapChange(toFilterMap(rootGroup));
    },
    [onFilterMapChange],
  );

  const numberOfRules = Object.values(filterMap).filter(
    (v) => v?.type === "Filter",
  ).length;

  return {
    schema,
    filterFnList,
    numberOfRules,
    filterableFields,
    rootRule: filterRule,

    mapFieldName,
    mapFilterName,
    getLocaleText,
    /**
     * @deprecated Use `rootRule` instead.
     */
    getRootRule,
    updateRootRule,
  };
};
