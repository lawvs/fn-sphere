import {
  isEqualPath,
  type FilterField,
  type SingleFilter,
  type StandardFnSchema,
} from "@fn-sphere/core";
import { useFilterRule } from "./use-filter-rule.js";
import { useFilterSchemaContext } from "./use-filter-schema-context.js";

export type UpdateFieldOptions = {
  /**
   * Try to continue using the current filter when the field is changed.
   *
   * @default true
   */
  tryRetainFilter?: boolean;
  /**
   * Automatically select the first filter when the field is changed and the filter is not retained.
   *
   * @default true
   */
  autoSelectFirstFilter?: boolean;
  /**
   * Try to continue using the current args when the field is changed.
   *
   * @default true
   */
  tryRetainArgs?: boolean;
};

export const useFilterSelect = (rule: SingleFilter) => {
  const {
    filterMap,
    filterableFields,
    mapFieldName,
    mapFilterName,
    getLocaleText,
  } = useFilterSchemaContext();
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
    label: getLocaleText(mapFieldName(field)),
    value: field,
  }));

  const selectedFilter = selectedField?.filterFnList.find(
    (filter) => filter.name === rule.name,
  );
  const filterOptions = selectedField?.filterFnList.map((filter) => ({
    label: getLocaleText(mapFilterName(filter, selectedField)),
    value: filter,
  }));

  const updateField = (
    newField: FilterField,
    {
      tryRetainFilter = true,
      autoSelectFirstFilter = true,
      tryRetainArgs = true,
    }: UpdateFieldOptions = {},
  ) => {
    if (!newField.filterFnList.length) {
      console.error("Field has no filter", newField);
      throw new Error("Field has no filter");
    }
    // Retain filter when possible
    const canRetainFilter = newField.filterFnList.some(
      (filter) => filter.name === rule.name,
    );
    const needRetainFilter = tryRetainFilter && canRetainFilter;
    const fallbackFilter = autoSelectFirstFilter
      ? newField.filterFnList[0].name
      : undefined;

    // TODO check if the arguments are matched new filter when autoSelectFirstFilter enabled
    const needRetainArgs = tryRetainArgs && needRetainFilter;

    updateRule({
      ...rule,
      path: newField.path,
      name: needRetainFilter ? rule.name : fallbackFilter,
      // If the filter is retained, keep the arguments
      args: needRetainArgs
        ? rule.args
        : // Reset arguments when field changed
          [],
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
