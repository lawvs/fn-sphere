import {
  isEqualPath,
  type FilterField,
  type SingleFilter,
  type StandardFnSchema,
} from "@fn-sphere/core";
import { useFilterRule } from "./use-filter-rule.js";
import { useFilterSchemaContext } from "./use-filter-schema-context.js";

export const useFilterSelect = (rule: SingleFilter) => {
  const { filterMap, filterableFields, mapFieldName, mapFilterName } =
    useFilterSchemaContext();
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

  const selectedFilter = selectedField?.filterFnList.find(
    (filter) => filter.name === rule.name,
  );
  const filterOptions = selectedField?.filterFnList.map((filter) => ({
    label: mapFilterName(filter, selectedField),
    value: filter,
  }));

  const updateField = (newField: FilterField) => {
    updateRule({
      ...rule,
      path: newField.path,
      // Clear filter name when field changed
      name: undefined,
      // name: newField.filterFnList[0].name,
      // Reset arguments when field changed
      args: [],
    });
  };

  const updateFilter = (filterSchema: StandardFnSchema) => {
    updateRule({
      ...rule,
      name: filterSchema.name,
      args: [],
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
