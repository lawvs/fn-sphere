import {
  isEqualPath,
  isValidRule,
  type LooseFilterGroup,
  type LooseFilterRule,
} from "@fn-sphere/core";
import { useContext } from "react";
import { getDepthOfRule, toFilterMap } from "../filter-map.js";
import { createEmptyFilterGroup, createEmptyRule } from "../utils.js";
import { FilterBuilderContext } from "./filter-provider.js";

export const useFilterRule = (rule: LooseFilterRule) => {
  const { schema, filterList, filterMap, filterableFields, onRuleChange } =
    useContext(FilterBuilderContext);

  const ruleNode = filterMap[rule.id];
  if (!ruleNode) {
    console.error("Rule not found in filterMap", filterMap, rule);
    throw new Error("Rule not found in filterMap");
  }
  const parentId = ruleNode.parentId;
  const parent = filterMap[parentId];
  if (parent?.type !== "FilterGroup") {
    console.error("Parent rule is not a group", filterMap, rule);
    throw new Error("Parent rule is not a group");
  }
  const index = parent.conditionIds.indexOf(rule.id);

  const selectedField = rule.path
    ? filterableFields.find((field) => isEqualPath(field.path, rule.path!))
    : undefined;
  // const fieldList = filterFields.map((field) => ({
  //   name: mapFieldName(field),
  //   value: field,
  // }));

  const selectedFilter = selectedField?.filterList.find(
    (filter) => filter.name === rule.name,
  );
  // const fieldFilterList = selectedField?.filterList.map((filter) => ({
  //   name: mapFilterName(filter, selectedField),
  //   value: filter,
  // }));

  // TODO ignore FilterId in user input
  // TODO check input data match the schema
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

  const removeRule = (removeEmptyGroup = false) => {
    if (removeEmptyGroup) {
      let targetRuleId = rule.id;
      let targetParent = parent;
      const newFilterMap = { ...filterMap };
      delete newFilterMap[targetRuleId];
      // Remove empty group recursively
      while (
        targetParent.conditionIds.length === 1 &&
        // Root group should not be removed
        targetParent.parentId !== targetParent.id
      ) {
        const newParentNode = newFilterMap[targetParent.parentId];
        if (!newParentNode || newParentNode.type !== "FilterGroup") {
          console.error("Parent rule is not a group", filterMap, rule);
          throw new Error("Parent rule is not a group");
        }
        delete newFilterMap[targetParent.id];
        targetRuleId = targetParent.id;
        targetParent = newParentNode;
      }
      newFilterMap[targetParent.id] = {
        ...targetParent,
        conditionIds: targetParent.conditionIds.filter(
          (id) => id !== targetRuleId,
        ),
      };
      console.log(newFilterMap);

      onRuleChange(newFilterMap);
      return;
    }
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
    ruleState: {
      index,
      isFirstRule: index === 0,
      isLastRule: index === parent.conditionIds.length - 1,
      isValid: isValidRule({
        dataSchema: schema,
        filterList,
        rule,
      }),
      depth: getDepthOfRule(filterMap, rule.id),
    },

    filterableFields,
    // fieldList,
    // fieldFilterList,
    selectedField,
    selectedFilter,

    updateRule,
    appendRule,
    appendGroup,
    removeRule,
    // moveRule,
    // duplicateRule,
    // wrapInGroup,
  };
};
