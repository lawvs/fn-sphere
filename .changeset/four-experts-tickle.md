---
"@fn-sphere/filter": patch
---

Rename `BasicFilterBuilderProps` to `BasicFilterSphereInput` and update type definitions.

Export new type `BasicFilterSphereProps`.

```ts
export interface BasicFilterSphereInput<Data = unknown> {
  filterRule: FilterGroup;
  schema: ZodType<Data>;
  filterList?: FnSchema[];
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
