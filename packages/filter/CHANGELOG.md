# @fn-sphere/filter

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
