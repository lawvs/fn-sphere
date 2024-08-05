# @fn-sphere/core

## 0.3.3

### Patch Changes

- caeeb9c: Move `createFilterGroup` and `createSingleFilter` to core package.

  Add `getFilterRule` method to `createFilterSphere`.

- 79abaa0: Update readme

## 0.3.2

## 0.3.1

## 0.3.0

### Patch Changes

- b31b201: Rename `filterList` to `filterFnList`

## 0.2.0

## 0.1.2

### Patch Changes

- 336fe84: `getParametersExceptFirst` now returns an array instead of a Zod tuple.

  ```ts
  import { getParametersExceptFirst } from "@fn-sphere/core";

  const schema = {
    name: "test",
    define: z.function().args(z.number(), z.boolean()).returns(z.void()),
    implement: () => {},
  };

  isSameType(z.tuple(getParametersExceptFirst(schema)), z.tuple([z.boolean()]));
  // true
  ```

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

## 0.1.0

### Minor Changes

- 5c84d94: first publish
