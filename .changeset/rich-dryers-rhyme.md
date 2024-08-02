---
"@fn-sphere/filter": minor
---

Add new `FilterSphereProvider` component to provide filter context to children components.

Add `useFilterSphere` hook to access filter predicate.

The `FilterBuilder` component no longer adds a provider to its child components.

```ts
const { filterRule, schema, predicate } = useFilterSphere<YourData>();
const filteredData = data.filter(predicate);
```
