---
"@fn-sphere/filter": patch
---

- Update `useFilterSphere` hook to use `predicate` instead of `getPredicate`:

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
