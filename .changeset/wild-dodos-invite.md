---
"@fn-sphere/filter": patch
"@fn-sphere/core": patch
---

Rename and export `FilterRule`

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
