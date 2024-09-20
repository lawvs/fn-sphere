---
"@fn-sphere/filter": minor
---

Export `filterableFields` in `useRootRule` hook.
Remove `filterableFields` from `useFilterRule` hook.

BREAKING CHANGE: The `filterableFields` is now exported in the `useRootRule` hook instead of the `useFilterRule` hook.

Migration:

```diff
+ const { filterableFields } = useRootRule();
- const { filterableFields } = useFilterRule(rule);
```
