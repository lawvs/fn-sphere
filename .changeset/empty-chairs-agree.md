---
"@fn-sphere/filter": minor
---

- Deprecated `onPredicateChange` in `useFilterSphere`
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
