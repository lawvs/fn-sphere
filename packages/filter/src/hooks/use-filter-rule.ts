import {
  isEqualPath,
  isValidRule,
  type FilterGroup,
  type SingleFilter,
} from "@fn-sphere/core";
import { getDepthOfRule, toFilterMap } from "../filter-map.js";
import { createFilterGroup, createSingleFilter } from "../utils.js";
import { useFilterSchemaContext } from "./use-filter-schema-context.js";

export const useFilterRule = (rule: SingleFilter) => {
  const {
    schema,
    filterFnList,
    filterMap,
    filterableFields,
    onFilterMapChange,
  } = useFilterSchemaContext();

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

  const selectedFilter = selectedField?.filterFnList.find(
    (filter) => filter.name === rule.name,
  );

  // TODO ignore FilterId in user input
  const updateRule = (newRule: SingleFilter) => {
    onFilterMapChange({
      ...filterMap,
      [rule.id]: {
        type: "Filter",
        data: newRule,
        parentId,
      },
    });
  };

  const appendRule = (newRule: SingleFilter = createSingleFilter()) => {
    onFilterMapChange({
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
    newFilterGroup: FilterGroup = createFilterGroup({
      op: "and",
      conditions: [createSingleFilter()],
    }),
  ) => {
    onFilterMapChange({
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

  /**
   * If removeEmptyGroup is true, remove the rule and remove empty group recursively
   *
   * Note: Root group should not be removed
   */
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
      onFilterMapChange(newFilterMap);
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
    onFilterMapChange(newFilterMap);
  };

  return {
    ruleState: {
      index,
      isFirstRule: index === 0,
      isLastRule: index === parent.conditionIds.length - 1,
      isValid: isValidRule({
        dataSchema: schema,
        filterFnList,
        rule,
      }),
      isInvert: rule.invert,
      depth: getDepthOfRule(filterMap, rule.id),
    },

    filterableFields,
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
