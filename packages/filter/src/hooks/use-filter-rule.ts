import {
  createFilterGroup,
  createSingleFilter,
  isEqualPath,
  isValidRule,
  type FilterGroupInput,
  type SingleFilter,
  type SingleFilterInput,
} from "@fn-sphere/core";
import { fromFilterMap, getDepthOfRule, toFilterMap } from "../filter-map.js";
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
  const parentNode = filterMap[parentId];
  if (parentNode?.type !== "FilterGroup") {
    console.error("Parent rule is not a group", filterMap, rule);
    throw new Error("Parent rule is not a group");
  }
  const index = parentNode.conditionIds.indexOf(rule.id);

  const rulePath = rule.path;
  const selectedField = rulePath
    ? filterableFields.find((field) => isEqualPath(field.path, rulePath))
    : undefined;

  const selectedFilter = selectedField?.filterFnList.find(
    (filter) => filter.name === rule.name,
  );

  const setRule = (input: SingleFilterInput) => {
    onFilterMapChange({
      ...filterMap,
      [rule.id]: {
        type: "Filter",
        data: {
          ...createSingleFilter(input),
          id: rule.id,
        },
        parentId,
      },
    });
  };

  /**
   * @deprecated Use {@link setRule} instead
   */
  const updateRule = setRule;

  const appendRule = (input?: SingleFilterInput) => {
    const newRule = createSingleFilter(input);
    onFilterMapChange({
      ...filterMap,
      [parentId]: {
        ...parentNode,
        conditionIds: [
          ...parentNode.conditionIds.slice(0, index + 1),
          newRule.id,
          ...parentNode.conditionIds.slice(index + 1),
        ],
      },
      [newRule.id]: {
        type: "Filter",
        data: newRule,
        parentId,
      },
    });
    return newRule;
  };

  const duplicateRule = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, ...ruleWithoutId } = rule;
    const newRule = createSingleFilter(ruleWithoutId);
    return appendRule(newRule);
  };

  const appendGroup = (
    input: FilterGroupInput = {
      op: "and",
      conditions: [createSingleFilter()],
    },
  ) => {
    const newFilterGroup = createFilterGroup(input);
    onFilterMapChange({
      ...filterMap,
      [parentId]: {
        ...parentNode,
        conditionIds: [
          ...parentNode.conditionIds.slice(0, index + 1),
          newFilterGroup.id,
          ...parentNode.conditionIds.slice(index + 1),
        ],
      },
      ...toFilterMap(newFilterGroup, parentId),
    });
    return newFilterGroup;
  };

  /**
   * If removeEmptyGroup is true, remove the rule and remove empty group recursively
   *
   * Note: Root group should not be removed
   */
  const removeRule = (removeEmptyGroup = false) => {
    if (removeEmptyGroup) {
      let targetRuleId = rule.id;
      let targetParent = parentNode;
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
        ...parentNode,
        conditionIds: parentNode.conditionIds.filter((id) => id !== rule.id),
      },
    };
    delete newFilterMap[rule.id];
    onFilterMapChange(newFilterMap);
  };

  const invertRule = (invert?: SingleFilter["invert"]) => {
    const oldInvert = rule.invert;
    const newInvert = invert === undefined ? !oldInvert : invert;
    if (oldInvert === newInvert) {
      return;
    }
    setRule({ ...rule, invert: newInvert });
  };

  const isLastRule = index === parentNode.conditionIds.length - 1;

  return {
    ruleState: {
      index,
      isFirstRule: index === 0,
      /**
       * If the rule is the last rule in the group
       */
      isLastRule,
      // isLastRuleInAllGroups: isLastRule && parentNode.isLastGroup,
      get isValid() {
        return isValidRule({
          dataSchema: schema,
          filterFnList,
          rule,
        });
      },
      isInvert: rule.invert,
      get depth() {
        return getDepthOfRule(filterMap, rule.id);
      },
      get parentGroup() {
        return fromFilterMap(filterMap, parentId);
      },
    },

    filterableFields,
    selectedField,
    selectedFilter,

    setRule,
    /**
     * @deprecated Use {@link setRule} instead
     */
    updateRule,
    appendRule,
    appendGroup,
    removeRule,
    // moveRule,
    duplicateRule,
    invertRule,
    // turnIntoGroup,
  };
};
