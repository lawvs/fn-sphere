import { type FilterGroup, type SingleFilter } from "@fn-sphere/core";
import { useContext } from "react";
import { getDepthOfRule, toFilterMap } from "../filter-map.js";
import { createEmptyFilterGroup, createEmptyFilterRule } from "../utils.js";
import { FilterBuilderContext } from "./filter-provider.js";

export const useFilterGroup = (ruleGroup: FilterGroup) => {
  const { filterMap, onRuleChange } = useContext(FilterBuilderContext);
  const ruleNode = filterMap[ruleGroup.id];
  if (!ruleNode) {
    console.error("Rule not found in filterMap", ruleGroup, filterMap);
    throw new Error("Rule not found in filterMap");
  }
  if (ruleNode.type !== "FilterGroup") {
    console.error("Rule is not a group", ruleGroup, filterMap);
    throw new Error("Rule is not a group");
  }
  if (ruleNode.id !== ruleGroup.id) {
    console.error("Rule id does not match", ruleNode, ruleGroup);
    throw new Error("Rule id does not match");
  }
  const parentId = ruleNode.parentId;
  const parent = filterMap[parentId];
  if (parent?.type !== "FilterGroup") {
    console.error("Parent rule is not a group", filterMap, ruleGroup);
    throw new Error("Parent rule is not a group");
  }
  const isRoot = parent.parentId === ruleGroup.id;
  const ruleIndex = parent.conditionIds.indexOf(ruleGroup.id);

  const toggleGroupOp = (op?: FilterGroup["op"]) => {
    const oldOp = ruleGroup.op;
    const newOp = (op ?? ruleGroup.op === "and") ? "or" : "and";
    if (oldOp === newOp) {
      return;
    }
    onRuleChange({
      ...filterMap,
      [ruleGroup.id]: {
        ...ruleNode,
        op: newOp,
      },
    });
  };

  const appendChildRule = (
    newRule: SingleFilter = createEmptyFilterRule(),
    index = Infinity,
  ) => {
    onRuleChange({
      ...filterMap,
      [ruleNode.id]: {
        ...ruleNode,
        conditionIds: [
          ...ruleNode.conditionIds.slice(0, index + 1),
          newRule.id,
          ...ruleNode.conditionIds.slice(index + 1),
        ],
      },
      [newRule.id]: {
        type: "Filter",
        data: newRule,
        parentId,
      },
    });
  };

  const appendChildGroup = (
    newFilterGroup: FilterGroup = createEmptyFilterGroup("and"),
    index = Infinity,
  ) => {
    onRuleChange({
      ...filterMap,
      [ruleNode.id]: {
        ...ruleNode,
        conditionIds: [
          ...ruleNode.conditionIds.slice(0, index + 1),
          newFilterGroup.id,
          ...ruleNode.conditionIds.slice(index + 1),
        ],
      },
      ...toFilterMap(newFilterGroup, parentId),
    });
  };

  const removeGroup = () => {
    const newFilterMap = {
      ...filterMap,
      [parentId]: {
        ...parent,
        conditionIds: parent.conditionIds.filter((id) => id !== ruleGroup.id),
      },
    };
    ruleNode.conditionIds.forEach((id) => {
      delete newFilterMap[id];
    });
    delete newFilterMap[ruleNode.id];
    onRuleChange(newFilterMap);
  };

  return {
    ruleState: {
      isRoot,
      index: ruleIndex,
      isFirstRule: ruleIndex === 0,
      isLastRule: ruleIndex === parent.conditionIds.length - 1,

      depth: getDepthOfRule(filterMap, ruleGroup.id),
    },

    toggleGroupOp,
    appendChildRule,
    appendChildGroup,
    removeGroup,
    // duplicateRule,
    // wrapWithGroup,
  };
};
