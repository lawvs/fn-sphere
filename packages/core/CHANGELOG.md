# @fn-sphere/core

## 0.8.0

### Patch Changes

- [`82696fa`](https://github.com/lawvs/fn-sphere/commit/82696fae32089d1fd88f4d4becdd1b4f05bf6e88) Thanks [@lawvs](https://github.com/lawvs)! - Update dependencies

## 0.6.0

### Minor Changes

- [#51](https://github.com/lawvs/fn-sphere/pull/51) [`a8b07f2`](https://github.com/lawvs/fn-sphere/commit/a8b07f24ed031e5ed3c4396cfdf7a603f5fb2209) Thanks [@lawvs](https://github.com/lawvs)! - Make string filter case insensitive

- [#51](https://github.com/lawvs/fn-sphere/pull/51) [`a8b07f2`](https://github.com/lawvs/fn-sphere/commit/a8b07f24ed031e5ed3c4396cfdf7a603f5fb2209) Thanks [@lawvs](https://github.com/lawvs)! - Add locale supports

  BREAKING CHANGE
  - All name of filter has been changed.
  - The `booleanFilter` has been removed.

- [`01369a8`](https://github.com/lawvs/fn-sphere/commit/01369a805b0fb644ddbb4e7dd334d7896651ac84) Thanks [@lawvs](https://github.com/lawvs)! - Breaking Changes
  - Removed support for array input in `defineTypedFn` and `defineGenericFn`.

### Patch Changes

- [`020bdb1`](https://github.com/lawvs/fn-sphere/commit/020bdb1dbdac9e6dfcf47d01bdeeb05d6bd13612) Thanks [@lawvs](https://github.com/lawvs)! - Add new utils function `createDefaultRule`

## 0.5.0

### Patch Changes

- f5eae65: Remove throw statements in filterFn
- 2b17977: Support literal union in preset fn

## 0.4.0

### Patch Changes

- e0f5632: Fix `isValidRule` incorrectly returned `false` for functions with `skipValidate` enabled

  Now, even if `skipValidate` is enabled, the input data is still checked for length.

- 744b13e: Allow attaching meta to filter rule
- b042713: Add countValidRules function

## 0.3.8

## 0.3.7

## 0.3.6

## 0.3.5

## 0.3.4

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
