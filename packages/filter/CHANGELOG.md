# @fn-sphere/filter

## 0.5.0

### Minor Changes

- ab1a0c6: - Deprecated `onPredicateChange` in `useFilterSphere`

  - ⚠️ BREAKING CHANGES

    - The `onRuleChange` callback in `useFilterSphere` now receives an object with both `filterRule` and `predicate` properties, instead of just the `filterRule`.
    - The `onPredicateChange` callback has been removed. Use the `predicate` property in the `onRuleChange` callback instead.

    ```ts
    export interface FilterSphereInput<Data>
      extends BasicFilterSphereInput<Data> {
      onRuleChange?: (data: {
        filterRule: FilterGroup;
        predicate: (data: Data) => boolean;
      }) => void;
    }

    const { context } = useFilterSphere({
      schema: YOUR_DATA_SCHEMA,
      onRuleChange: ({ predicate }) => {
        const filteredData = YOUR_DATA.filter(predicate);
        console.log(filteredData);
      },
    });
    ```

  - Migration Guide

  ```diff
  const { context } = useFilterSphere({
    schema: YOUR_DATA_SCHEMA,
  -  onRuleChange: (filterRule) => {
  -    console.log(filterRule);
  -  },
  -  onPredicateChange: (predicate) => {
  -    const filteredData = YOUR_DATA.filter(predicate);
  -    console.log(filteredData);
  -  },
  +  onRuleChange: ({ filterRule, predicate }) => {
  +    const filteredData = YOUR_DATA.filter(predicate);
  +    console.log(filterRule, filteredData);
  +  },
  });
  ```

- 87acc5e: - BREAKING CHANGES

  - `updateInput` in `DataInputViewProps` now use spread parameter to accept new values.

  ```diff
  - updateInput([newValue]);
  + updateInput(newValue);
  ```

- 70565bc: - BREAKING CHANGES
  - Increased spacing in templates
  - Enhanced `SingleFilterContainer` styling:
    - Improved vertical alignment of child elements
  - Remove `isValid` flag from `FilterRule`
  - Move `Add Condition` and `Add Group` buttons to the `FilterGroupContainer`

### Patch Changes

- 4a6e88a: Support multiple select for literal union
- 03624b8: Add multiple select
- f03f6e2: Remove unnecessary ref prop from data input views
- Updated dependencies [f5eae65]
- Updated dependencies [2b17977]
  - @fn-sphere/core@0.5.0

## 0.4.0

### Minor Changes

- 55b7fb1: - In `useFilterSelect`:
  - The `updateField` function has been deprecated and replaced with `setField` for clarity and consistency.
  - The `updateFilter` function has been deprecated and replaced with `setFilter`.
  - In `useFilterRule`:
    - The `updateRule` function has been renamed to `setRule`
    - Added a new `duplicateRule` function to duplicate a rule.
    - Added a new `invertRule` function.
  - In `useFilterGroup` and `useFilterRule`:
    - The parameter `SingleFilter` has been changed to `SingleFilterInput` for simplicity.
    - The parameter `FilterGroup` has been changed to `FilterGroupInput` for simplicity.
- e05bcbe: Removed inline theme merging logic from `FilterSphereProvider`.

  Introduced `createFilterTheme` for theme merging.

  Migration guide:

  ```diff
  -  <FilterSphereProvider theme={customTheme}>
  + const theme = createFilterTheme(customTheme);
  +  <FilterSphereProvider theme={theme}>
  ```

### Patch Changes

- 0ce4129: Add `tryRetainArgs` to allow retaining `args` when filter is changed
- d4c6a7d: - Update `useFilterSphere` hook to use `predicate` instead of `getPredicate`:

  ```diff
  import { useFilterSphere } from "@fn-sphere/filter";

  - const { rule, predicate, context } = useFilterSphere({
  + const { rule, getPredicate, context } = useFilterSphere({
    schema: YOUR_DATA_SCHEMA,
  });

  - const filteredData = YOUR_DATA.filter(getPredicate());
  + const filteredData = YOUR_DATA.filter(predicate);
  ```

  - Update `countTotalRules()` to `get totalRuleCount` in `useFilterSphere` hook
  - Add `validRuleCount` to `useFilterSphere` hook to get the count of valid rules

- c5ad41a: Add `countValidRules` function to `useFilterSphere` hook

  ```ts
  const { countValidRules } = useFilterSphere();
  const validRulesCount = countValidRules();
  ```

- 311f306: - Added the ability to retain the current filter and arguments when the field is changed in the `useFilterSelect` hook.

  - Introduced the `UpdateFieldOptions` type to specify the behavior when updating the field.
  - Updated the `FieldSelect` component to pass the `updateFieldOptions` to the `updateField` function.

  ```tsx
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

  <FieldSelect
    rule={rule}
    tryRetainFilter
    autoSelectFirstFilter
    tryRetainArgs
  />;
  ```

- Updated dependencies [e0f5632]
- Updated dependencies [744b13e]
- Updated dependencies [b042713]
  - @fn-sphere/core@0.4.0

## 0.3.8

### Patch Changes

- 19e8e38: Update preset templates
  - @fn-sphere/core@0.3.8

## 0.3.7

### Patch Changes

- 715e792: Add `getLocaleText` API
  - @fn-sphere/core@0.3.7

## 0.3.6

### Patch Changes

- b272f24: Export `FnSchema`, `StandardFnSchema` and `GenericFnSchema` type from core package.

  Export `defineGenericFn` and `defineTypedFn` from core package.

  - @fn-sphere/core@0.3.6

## 0.3.5

### Patch Changes

- 98b38de: Add field schema to the match function in the `DataInputViewSpec`.
- 75feec4: Update data input view to handle empty values

  If input value is empty string, the input view will update the rule args to `[]` instead of `[""]`. This is to prevent the rule from running with an empty string as an argument.

  - @fn-sphere/core@0.3.5

## 0.3.4

### Patch Changes

- 51abfaa: Export `FilterField`
  - @fn-sphere/core@0.3.4

## 0.3.3

### Patch Changes

- caeeb9c: Move `createFilterGroup` and `createSingleFilter` to core package.

  Add `getFilterRule` method to `createFilterSphere`.

- 79abaa0: Update readme
- Updated dependencies [caeeb9c]
- Updated dependencies [79abaa0]
  - @fn-sphere/core@0.3.3

## 0.3.2

### Patch Changes

- 2a8d304: Add new `reset` method to `useFilterSphere` hook
- 3ccf45a: Update styles for default templates
  - @fn-sphere/core@0.3.2

## 0.3.1

### Patch Changes

- aef8fbc: Fix `numberOfRules` should only count the SingleRule and not the RuleGroup.

  Return `countTotalRules` function to `useFilterSphere` hook.

  - @fn-sphere/core@0.3.1

## 0.3.0

### Minor Changes

- 49df2cd: Add new `FilterSphereProvider` component to provide filter context to children components.

  Add `useFilterSphere` hook to access filter predicate.

  The `FilterBuilder` component no longer adds a provider to its child components.

  ```ts
  const { filterRule, schema, predicate } = useFilterSphere<YourData>();
  const filteredData = data.filter(predicate);
  ```

- c66db35: Redesign `useFilterSphere` hook to return a `getPredicate` function and a `context` object.

  ```ts
  import { useFilterSphere } from "@fn-sphere/filter";

  const { getPredicate, context } = useFilterSphere<YourData>({
    schema: yourDataSchema,
  });
  const predicate = getPredicate();
  const filteredData = data.filter(predicate);
  ```

### Patch Changes

- 1c4bfae: Rename `BasicFilterBuilderProps` to `BasicFilterSphereInput` and update type definitions.

  Export new type `BasicFilterSphereProps`.

  ```ts
  export interface BasicFilterSphereInput<Data = unknown> {
    filterRule: FilterGroup;
    schema: ZodType<Data>;
    filterFnList?: FnSchema[];
    fieldDeepLimit?: number;
    mapFieldName?: (field: FilterField) => string;
    mapFilterName?: (
      filterSchema: StandardFnSchema,
      field: FilterField,
    ) => string;
    onRuleChange?: (rule: FilterGroup) => void;
  }

  export type BasicFilterSphereProps<Data = unknown> = Required<
    BasicFilterSphereInput<Data>
  >;
  ```

- 1ac1c43: Rename `createEmptyFilter` to `createEmptySingleFilter` and `createEmptyFilterGroup` to `createFilterGroup`.
- 1ac1c43: Add `SingleFilterContainer` to template.
- 991d8e7: Export `useRootRule` and `useFilterSelect` hooks.
- b31b201: Rename `filterList` to `filterFnList`
- Updated dependencies [b31b201]
  - @fn-sphere/core@0.3.0

## 0.2.0

### Minor Changes

- 742c3af: Refactor API

### Patch Changes

- @fn-sphere/core@0.2.0

## 0.1.3

### Patch Changes

- 1670687: Export presetFilter

## 0.1.2

### Patch Changes

- b9d3b0a: chore: add type export for filter specs
- b9d3b0a: Rename and export `FilterRule`

  ```ts
  interface SingleFilter {
    type: "Filter";
    /**
     * Field path
     *
     * If it's a empty array, it means the root object.
     * If not provided, it means user didn't select a field.
     */
    path?: FilterPath;
    /**
     * Filter name
     *
     * If not provided, it means user didn't select a filter.
     */
    name?: string;
    /**
     * Arguments for the filter function
     */
    args: unknown[];
    invert?: boolean;
  }

  interface SingleFilter extends SingleFilterInput {
    /**
     * Unique id, used for tracking changes or resorting
     */
    id: FilterId;
  }

  export interface FilterGroupInput {
    type: "FilterGroup";
    op: "and" | "or";
    conditions: (SingleFilter | FilterGroup)[];
    invert?: boolean;
  }

  export interface FilterGroup extends FilterGroupInput {
    /**
     * Unique id, used for tracking changes or resorting
     */
    id: FilterId;
  }

  export type FilterRule = SingleFilter | FilterGroup;
  ```

- Updated dependencies [336fe84]
- Updated dependencies [b9d3b0a]
  - @fn-sphere/core@0.1.2

## 0.1.1

### Patch Changes

- d7460ba: export UiSpec

## 0.1.0

### Minor Changes

- 5c84d94: first publish

### Patch Changes

- Updated dependencies [5c84d94]
  - @fn-sphere/core@0.1.0
