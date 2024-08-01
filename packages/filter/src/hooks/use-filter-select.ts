import {
  isEqualPath,
  type FilterField,
  type SingleFilter,
  type StandardFnSchema,
} from "@fn-sphere/core";
import { useFilterBuilderContext } from "./use-filter-builder-context.js";
import { useFilterRule } from "./use-filter-rule.js";

export const useFilterSelect = (rule: SingleFilter) => {
  const { filterMap, filterableFields, mapFieldName, mapFilterName } =
    useFilterBuilderContext();
  const { updateRule } = useFilterRule(rule);

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

  const selectedField = rule.path
    ? filterableFields.find((field) => isEqualPath(field.path, rule.path!))
    : undefined;

  const fieldOptions = filterableFields.map((field) => ({
    label: mapFieldName(field),
    value: field,
  }));

  const selectedFilter = selectedField?.filterList.find(
    (filter) => filter.name === rule.name,
  );
  const filterOptions = selectedField?.filterList.map((filter) => ({
    label: mapFilterName(filter, selectedField),
    value: filter,
  }));

  const updateField = (newField: FilterField) => {
    updateRule({
      ...rule,
      path: newField.path,
      // Clear filter name when field changed
      name: undefined,
      // name: newField.filterList[0].name,
      // Reset arguments when field changed
      args: [],
    });
  };

  const updateFilter = (filterSchema: StandardFnSchema) => {
    updateRule({
      ...rule,
      name: filterSchema.name,
    });
  };

  return {
    filterableFields,
    selectedField,
    selectedFilter,
    fieldOptions,
    filterOptions,

    updateField,
    updateFilter,
  };
};
