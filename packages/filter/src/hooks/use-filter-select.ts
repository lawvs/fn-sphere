import {
  isEqualPath,
  isSameType,
  type FilterField,
  type SingleFilter,
  type StandardFnSchema,
} from "@fn-sphere/core";
import { useFilterRule } from "./use-filter-rule.js";
import { useFilterSchemaContext } from "./use-filter-schema-context.js";

export interface UpdateFilterOptions {
  /**
   * Try to continue using the current args when the field is changed.
   *
   * @default true
   */
  tryRetainArgs?: boolean;
}

export interface UpdateFieldOptions extends UpdateFilterOptions {
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
}

export const useFilterSelect = (rule: SingleFilter) => {
  const {
    filterMap,
    filterableFields,
    mapFieldName,
    mapFilterName,
    getLocaleText,
  } = useFilterSchemaContext();
  const { setRule } = useFilterRule(rule);

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

  /**
   * Checks if the new filter schema has the same arguments as the current filter schema.
   */
  const canRetainArgs = (newFilterSchema: StandardFnSchema) => {
    if (!selectedField) {
      return false;
    }
    const currentFilterSchema = selectedField.filterFnList.find(
      (filter) => filter.name === rule.name,
    );
    if (!currentFilterSchema) {
      // Select filter first time
      return false;
    }
    return isSameType(
      newFilterSchema.define._zod.def.input,
      currentFilterSchema.define._zod.def.input,
    );
  };

  const setField = (
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
    // If new field has the same filter, it can be retained
    const theSameFilterInNewField = newField.filterFnList.find(
      (filter) => filter.name === rule.name,
    );
    const canRetainFilter = !!theSameFilterInNewField;
    const needRetainFilter = tryRetainFilter && canRetainFilter;
    const fallbackFilter = autoSelectFirstFilter
      ? newField.filterFnList[0]
      : undefined;

    const newFilterSchema = needRetainFilter
      ? theSameFilterInNewField
      : fallbackFilter;

    const needRetainArgs =
      tryRetainArgs &&
      newFilterSchema &&
      // For generic filter, the new filter schema is not the same as the current filter schema
      // even if the filter name is the same, eg. Equals string -> Equals number
      // needRetainFilter &&
      canRetainArgs(newFilterSchema);

    setRule({
      ...rule,
      path: newField.path,
      name: newFilterSchema?.name,
      // If the filter is retained, keep the arguments
      args: needRetainArgs
        ? rule.args
        : // Reset arguments when field changed
          [],
    });
  };

  /**
   * @deprecated Use {@link setField} instead
   */
  const updateField = setField;

  const setFilter = (
    filterSchema: StandardFnSchema,
    { tryRetainArgs = true }: UpdateFilterOptions = {},
  ) => {
    const needRetainArgs = tryRetainArgs && canRetainArgs(filterSchema);
    setRule({
      ...rule,
      name: filterSchema.name,
      args: needRetainArgs ? rule.args : [],
    });
  };

  /**
   * @deprecated Use {@link setFilter} instead
   */
  const updateFilter = setFilter;

  return {
    filterableFields,
    selectedField,
    selectedFilter,
    fieldOptions,
    filterOptions,

    setField,
    setFilter,

    /**
     * @deprecated Use {@link setField} instead
     */
    updateField,
    /**
     * @deprecated Use {@link setFilter} instead
     */
    updateFilter,
  };
};
