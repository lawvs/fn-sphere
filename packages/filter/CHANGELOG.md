# @fn-sphere/filter

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
