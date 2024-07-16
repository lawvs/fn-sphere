import {
  isEqualPath,
  type LooseFilterGroup,
  type LooseFilterRule,
} from "@fn-sphere/core";
import { useContext } from "react";
import {
  createEmptyFilterGroup,
  createEmptyRule,
  toFilterMap,
} from "../utils.js";
import { FilterBuilderContext } from "./filter-provider.js";

export const useFilterRule = (rule: LooseFilterRule) => {
  const { filterMap, filterFields, onRuleChange, mapFieldName, mapFilterName } =
    useContext(FilterBuilderContext);

  const parentId = filterMap[rule.id].parentId;
  const parent = filterMap[parentId];
  if (parent.type !== "FilterGroup") {
    console.error("Parent rule is not a group", filterMap, rule);
    throw new Error("Parent rule is not a group");
  }
  const index = parent.conditionIds.indexOf(rule.id);

  const selectedField = rule.path
    ? filterFields.find((field) => isEqualPath(field.path, rule.path!))
    : undefined;
  const fieldList = filterFields.map((field) => ({
    name: mapFieldName(field),
    value: field,
  }));

  const selectedFilter = selectedField?.filterList.find(
    (filter) => filter.name === rule.name,
  );
  const fieldFilterList = selectedField?.filterList.map((filter) => ({
    name: mapFilterName(filter, selectedField),
    value: filter,
  }));

  // TODO ignore FilterId in user input
  const updateRule = (newRule: LooseFilterRule) => {
    onRuleChange({
      ...filterMap,
      [rule.id]: {
        type: "Filter",
        data: newRule,
        parentId,
      },
    });
  };

  const appendRule = (newRule: LooseFilterRule = createEmptyRule()) => {
    onRuleChange({
      ...filterMap,
      [parentId]: {
        ...parent,
        conditionIds: [
          ...parent.conditionIds.slice(0, index + 1),
          newRule.id,
          ...parent.conditionIds.slice(index + 1),
        ],
      },
      [newRule.id]: {
        type: "Filter",
        data: newRule,
        parentId,
      },
    });
  };
  const appendGroup = (
    newFilterGroup: LooseFilterGroup = createEmptyFilterGroup("and"),
  ) => {
    onRuleChange({
      ...filterMap,
      [parentId]: {
        ...parent,
        conditionIds: [
          ...parent.conditionIds.slice(0, index + 1),
          newFilterGroup.id,
          ...parent.conditionIds.slice(index + 1),
        ],
      },
      ...toFilterMap(newFilterGroup, parentId),
    });
  };

  const removeRule = () => {
    const newFilterMap = {
      ...filterMap,
      [parentId]: {
        ...parent,
        conditionIds: parent.conditionIds.filter((id) => id !== rule.id),
      },
    };
    delete newFilterMap[rule.id];
    onRuleChange(newFilterMap);
  };

  return {
    index,
    isValid:
      !!selectedField &&
      !!selectedFilter &&
      rule.arguments.length === selectedFilter.define.parameters.length - 1,

    fieldList,
    selectedField,

    fieldFilterList,
    selectedFilter,

    mapFieldName,
    mapFilterName,

    updateRule,
    appendRule,
    appendGroup,
    removeRule,
    // duplicateRule,
    // wrapWithGroup,
  };
};
