import {
  createDefaultRule,
  createFilterGroup,
  createSingleFilter,
  type FilterGroup,
  type FilterGroupInput,
  type SingleFilterInput,
} from "@fn-sphere/core";
import { getDepthOfRule, toFilterMap } from "../filter-map.js";
import { useFilterSchemaContext } from "./use-filter-schema-context.js";

export const useFilterGroup = (ruleGroup: FilterGroup) => {
  const { filterMap, filterableFields, onFilterMapChange } =
    useFilterSchemaContext();
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
  const maybeParentNode = filterMap[parentId];
  if (!maybeParentNode) {
    console.error("Parent node not found", parentId, ruleGroup, filterMap);
    throw new Error("Parent node not found");
  }
  const parentNode = parentId === ruleGroup.id ? null : maybeParentNode;
  const isRoot = !parentNode;
  if (parentNode && parentNode.type !== "FilterGroup") {
    console.error("Parent rule is not a group", filterMap, ruleGroup);
    throw new Error("Parent rule is not a group");
  }
  const ruleIndex = isRoot ? 0 : parentNode.conditionIds.indexOf(ruleGroup.id);

  const toggleGroupOp = (op?: FilterGroup["op"]) => {
    const oldOp = ruleGroup.op;
    const newOp = (op ?? ruleGroup.op === "and") ? "or" : "and";
    if (oldOp === newOp) {
      return;
    }
    onFilterMapChange({
      ...filterMap,
      [ruleGroup.id]: {
        ...ruleNode,
        op: newOp,
      },
    });
  };

  const appendChildRule = (input?: SingleFilterInput, index = Infinity) => {
    const newRule = input
      ? createSingleFilter(input)
      : createDefaultRule(filterableFields);
    onFilterMapChange({
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
    input: FilterGroupInput = {
      op: "and",
      conditions: [createDefaultRule(filterableFields)],
    },
    index = Infinity,
  ) => {
    const newFilterGroup = createFilterGroup(input);
    onFilterMapChange({
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
    if (isRoot) {
      console.error("Cannot remove root group");
      throw new Error("Cannot remove root group");
    }
    const newFilterMap = {
      ...filterMap,
      [parentId]: {
        ...parentNode,
        conditionIds: parentNode.conditionIds.filter(
          (id) => id !== ruleGroup.id,
        ),
      },
    };
    ruleNode.conditionIds.forEach((id) => {
      delete newFilterMap[id];
    });
    delete newFilterMap[ruleNode.id];
    onFilterMapChange(newFilterMap);
  };

  return {
    ruleState: {
      isRoot,
      index: ruleIndex,
      isFirstGroup: ruleIndex === 0,
      isLastGroup: isRoot
        ? true
        : ruleIndex === parentNode.conditionIds.length - 1,

      get depth() {
        return getDepthOfRule(filterMap, ruleGroup.id);
      },
    },

    toggleGroupOp,
    appendChildRule,
    appendChildGroup,
    removeGroup,
    // duplicateGroup,
  };
};
