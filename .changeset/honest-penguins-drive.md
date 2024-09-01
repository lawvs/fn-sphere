---
"@fn-sphere/filter": minor
---

Breaking Changes

- Now the first field and the first filter will be selected by default when creating a new rule.
  - Updated `useFilterSphere` to use `createDefaultRule` for default rule creation.
  - Updated `useFilterGroup` and `useFilterRule` to use `createDefaultRule` when no input is provided.
