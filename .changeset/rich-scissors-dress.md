---
"@fn-sphere/filter": minor
---

Redesign `useFilterSphere` hook to return a `getPredicate` function and a `context` object.

```ts
import { useFilterSphere } from "@fn-sphere/filter";

const { getPredicate, context } = useFilterSphere<YourData>({
  schema: yourDataSchema,
});
const predicate = getPredicate();
const filteredData = data.filter(predicate);
```
